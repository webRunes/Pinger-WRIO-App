import db from './utils/db';
import nconf from 'nconf';
import {Promise} from 'es6-promise';


// used to deserialize the user
function deserialize(id, done) {
    var webrunesUsers = db.db.collection('webRunes_Users');
    var sessions = db.db.collection('sessions');
    console.log("Deserializing user by id=" + id);
    webrunesUsers.findOne(db.ObjectID(id),function (err,user) {
        if (err || !user) {
            console.log("User not found", err);
            done(err);
            return;
        }
        done(err, user);
    });
};

export function loginWithSessionId(ssid, done) {
    var sessions = db.db.collection('sessions');
    var match = ssid.match(/^[-A-Za-z0-9+/=_]+$/m);
    if (!match) {
        console.log("Wrong ssid");
        done("Error");
        return;
    }
    console.log("Trying deserialize session",ssid);
    sessions.findOne({"_id": ssid}, function(err, session) {
        if (err || !session) {
            console.log("User not found", err);
            done(err);
            return;
        }

        console.log("Session deserialized " + ssid, session);
        var data = JSON.parse(session.session);
        if (data.passport) {
            var user = data.passport.user;
        } else {
            user = undefined;
        }

        console.log(user);

        if (user != undefined) {
            deserialize(user, done);
        } else {
            done("Wrong cookie");
        }

        //done(err, rows[0]);
    });
}

export function getTwitterCredentials(request) {

    return {
        "token": request.user.token,
        "tokenSecret": request.user.tokenSecret
    };
}



export function getLoggedInUser(ssid) {
    return new Promise((resolve, reject) => {
        loginWithSessionId(ssid, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}

/*
export function authS2S(request,response,next) {
    var creds = auth(request);
    var login = nconf.get("service2service:login");
    var password = nconf.get("service2service:password");
    if (creds && login && password) {
        if ((creds.name === login) && (creds.pass === password)) {
            next();
            return;
        }
    }
    console.log("Access denied");
    response.status(403).send("Access denied");
}*/

function isAdmin(id) {
    var admins = nconf.get('payment:admins');
    if (!admins) {
        return false;
    }
    var result = false;
    admins.forEach((user)=> {
        if (id == user) {
            result = true;
        }
    });
    return result;
}

export let wrap = fn => (...args) => fn(...args).catch(args[2]);

export function wrioAuth(req,resp,next) {

    loginWithSessionId(req.sessionID, (err, user) => {
        if (err) {
            console.log("Permission denied",e);
            dumpError(e);
            return resp.status(403).send("Error");
        }
        req.user = user;
        next();
    });

}

export function wrioAdmin(req,resp,next) {
    wrioAuth(req,resp,() => {
        if (isAdmin(req.user.wrioID)) {
            next();
        } else {
            resp.status(403).send("Error: Not admin");
        }
    });

}
