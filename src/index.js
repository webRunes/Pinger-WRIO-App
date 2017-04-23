import nconf from "./wrio_nconf.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
//import {loginWithSessionId, getTwitterCredentials, getLoggedInUser, wrap, wrioAuth} from './wriologin.js';
import titterPicture from "./titter-picture";
import titterSender from "./titter-sender";
import express from "express";
import request from "superagent";
import { startPhantom, getSharedWidgetID } from "./widget-extractor/phantom.js";
import { server, db, utils, login } from "wriocommon";
import logger from "winston";
import DeferredTweet from "./dbmodels/DeferredTweet.js";
import amqplib from "amqplib";

var DOMAIN = nconf.get("db:workdomain");
var dumpError = utils.dumpError;
let { wrap, wrioAuth } = login;

var queuePromise = require("amqplib").connect(nconf.get("rabbitmq:url"));

queuePromise.then(() => console.log("Connected to the queue")).catch(err => {
  console.log("Unable connect to the queue, aborting", err);
  process.exit(-1);
});

var app = express();
app.ready = function() {};

async function init_env() {
  try {
    await init();
  } catch (e) {
    console.log("Caught error during server init");
    utils.dumpError(e);
  }
}

async function init() {
  var dbInstance = await db.init();
  logger.log("info", "Successfuly connected to Mongo");
  server.initserv(app, dbInstance);
  app.listen(nconf.get("server:port"));
  console.log("app listening on port " + nconf.get("server:port") + "...");
  app.use("/api/", require("./api/api-search.js"));
  app.use("/api/", require("./api/api-reply.js"));
  server_setup(db);
  console.log("Application Started on ", nconf.get("server:port"));
  app.ready();
}

init_env();

function getTwitterCredentials(request) {
  return {
    token: request.user.token,
    tokenSecret: request.user.tokenSecret
  };
}

function server_setup(db) {
  handleDeferred();
  //wrioLogin = require('./wriologin')(db);

  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");

  var p3p = require("p3p");
  app.use(p3p(p3p.recommended));
  app.use(express.static(__dirname + "/"));

  app.get("/iframe/", wrioAuth, async (request, response) => {
    var origin = request.query.origin;
    console.log("ORIGIN: ", origin);

    try {
      var user = request.user;
      if (user.temporary) {
        throw new Error("Temporary user, allow to login");
      }
      console.log("User found " + user);
      response.render("create.ejs", {
        user: user,
        userID: request.query.id,
        host: decodeURIComponent(origin)
      });
    } catch (e) {
      console.log("User not found:", e);
      response.render("create.ejs", {
        error: "Not logged in",
        user: undefined,
        host: decodeURIComponent(origin),
        userID: request.query.id
      });
    }
  });

  app.get("/logoff", function(request, response) {
    console.log("Logoff called");
    response.clearCookie("sid", {
      path: "/",
      domain: DOMAIN
    });
    response.send("OK");
    //response.redirect('/?create');
  });

  app.get("/callback", function(request, response) {
    console.log("Our callback called");
    response.render("callback", {});
  });

  app.get("/donatePopup", function(request, response) {
    response.render("donatepopup", {});
  });

  app.get("/get_widget_id", function(request, response) {
    var login = request.query.login;
    var password = request.query.password;
    var query = request.query.query;

    if (!login || !password || !query) {
      return response.status(403).send("Wrong parameters");
    }

    startPhantom(login, password, query).then(function(code) {
      response.send(code);
    });
  });

  app.get("/obtain_widget_id", wrioAuth, async (request, response) => {
    var query = request.query.query;

    //console.log("DBG:",request.session);

    if (!query) {
      return response.status(403).send("Wrong parameters");
    }

    try {
      var user = request.user;
      var code = await getSharedWidgetID(user.wrioID, query);

      response.send(code);
    } catch (e) {
      dumpError(e);
      return response.status(403).send("Error during execution of request");
    }
  });

  /* Request donate from webgold via api*/

  async function requestDonate(from, to, amount) {
    let proto = "https:";
    if (nconf.get("server:workdomain") == ".wrioos.local") {
      proto = "http:";
    }
    const url =
      proto +
      "//webgold" +
      nconf.get("server:workdomain") +
      "/api/webgold/donate?amount=" +
      amount +
      "&to=" +
      to +
      "&from=" +
      from;

    const login = nconf.get("service2service:login");
    const pass = nconf.get("service2service:password");

    let res = await request.get(url).auth(login, pass);

    return res.body;
  }

  app.post(
    "/requestDonate",
    multer().array("images[]"),
    wrioAuth,
    wrap(async (request, response) => {
      let text = request.body.text;
      let title = request.body.title || "";
      let message = request.body.comment || "";
      let amount = request.query.amount;
      let to = request.query.to;
      let creds = getTwitterCredentials(request);

      console.log("Requesting donate " + message);

      let amountUser = 0;
      let donateResult = {};

      donateResult = await requestDonate(request.user.wrioID, to, amount);
      console.log("Donation request result", donateResult);
      if (donateResult.success == false) {
        return response.status(403).send({ error: donateResult.error });
      }

      let d = new DeferredTweet(); //send tweet later, when transaction executed
      await d.create(donateResult.txID, amount, text, title, message, creds);

      donateResult = {
        status: "Done",
        donated: amount,
        amountUser: amountUser,
        callback: donateResult.callback
      };
      console.log("Donation result: ", donateResult);
      response.send(donateResult);
    })
  );

  app.post(
    "/sendComment",
    multer().array("images[]"),
    wrioAuth,
    wrap(async (request, response) => {
      let text = request.body.text || " ";
      let title = request.body.title || "";
      let message = request.body.comment || "";

      console.log("Sending comment " + message);
      let creds = getTwitterCredentials(request);

      console.log("Sending tweet right away");
      await sendTweet(
        0,
        text,
        title,
        message,
        await extractFiles(creds, request.files),
        creds
      );
      response.send({  status: "Done", });
    })
  );

  // extracts media_id's from the request.files property
  async function extractFiles(cred, files) {
    const data = await Promise.all(
      files.map(file => {
        // upload in parallel
        return titterSender.uploadP(cred, file.buffer);
      })
    );
    return data.map(data => data.media_id_string);
  }

  app.use("/", express.static(path.join(__dirname, "..", "/hub/")));
  app.use("/js/", express.static(path.join(__dirname, ".", "/clientjs/")));

  app.use(function(err, req, res, next) {
    dumpError(err);
    res.status(403).send("There was an error processing your request");
  });

  console.log("Titter server config finished");
}

async function sendTitterComment(cred, amount, text, images, title, message) {
  // sends comment and
  console.log("SendTitterComment");

  if (text) {
    var filename = await titterPicture.drawCommentP(text);
    var data = await titterSender.uploadP(cred, filename);

    try {
      console.log(data);
      data = JSON.parse(data);
    } catch (e) {}
    if (data["errors"]) {
      throw new Error("Upload failed, check twitter credentials ");
    }
    images.unshift(data.media_id_string);
    console.log("Sending images: ", images);
  }
  return await titterSender.replyP(
    cred,
    title + "\n" + message + " Donated " + amount + " THX",
    images
  );
}

async function sendTweet(amount, text, title, message, files, creds) {
  console.log("got keys", creds);
  await sendTitterComment(creds, amount, text, files, title, message);
}

// handle tweets, that will be sent after the money transfer

async function handleDeferred() {
  const queue = await queuePromise;
  const queuename = nconf.get("rabbitmq:tweetQueue");
  console.log("Listening to the queue", queuename);
  let ch = await queue.createChannel();
  await ch.assertQueue(queuename);
  ch.consume(
    queuename,
    async msg => {
      try {
        if (msg !== null) {
          const payload = msg.content.toString();
          console.log("Got response from the queue, sending tweet", payload);
          let d = new DeferredTweet();
          let tweetData = await d.get({ associatedTx: payload });
          if (tweetData) {
            await sendTweet(
              tweetData.amount,
              tweetData.text,
              tweetData.title,
              tweetData.message,
              [],
              tweetData.creds
            );
          } else {
            console.log("Cannot find deferred tweet", msg);
          }
        }
      } catch (e) {
        console.log("Error during message received from the queue", e);
        dumpError(e);
      }
    },
    { noAck: true }
  );
}

module.exports = app; // For unit testing purposes
