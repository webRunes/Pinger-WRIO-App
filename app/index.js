'use strict';

var init_env = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return init();

                    case 3:
                        _context.next = 9;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context['catch'](0);

                        console.log("Caught error during server init");
                        _wriocommon.utils.dumpError(_context.t0);

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 5]]);
    }));

    return function init_env() {
        return _ref.apply(this, arguments);
    };
}();

var init = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var dbInstance;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return _wriocommon.db.init();

                    case 2:
                        dbInstance = _context2.sent;

                        _winston2.default.log('info', 'Successfuly connected to Mongo');
                        _wriocommon.server.initserv(app, dbInstance);
                        app.listen(_wrio_nconf2.default.get("server:port"));
                        console.log('app listening on port ' + _wrio_nconf2.default.get('server:port') + '...');
                        app.use('/api/', require('./api/api-search.js'));
                        app.use('/api/', require('./api/api-reply.js'));
                        server_setup(_wriocommon.db);
                        console.log("Application Started on ", _wrio_nconf2.default.get("server:port"));
                        app.ready();

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function init() {
        return _ref2.apply(this, arguments);
    };
}();

var _wrio_nconf = require('./wrio_nconf.js');

var _wrio_nconf2 = _interopRequireDefault(_wrio_nconf);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _titterPicture = require('./titter-picture');

var _titterPicture2 = _interopRequireDefault(_titterPicture);

var _titterSender = require('./titter-sender');

var _titterSender2 = _interopRequireDefault(_titterSender);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _phantom = require('./widget-extractor/phantom.js');

var _wriocommon = require('wriocommon');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//import {loginWithSessionId, getTwitterCredentials, getLoggedInUser, wrap, wrioAuth} from './wriologin.js';


var DOMAIN = _wrio_nconf2.default.get('db:workdomain');
var dumpError = _wriocommon.utils.dumpError;
var wrap = _wriocommon.login.wrap,
    wrioAuth = _wriocommon.login.wrioAuth;


var app = (0, _express2.default)();
app.ready = function () {};

init_env();

function getTwitterCredentials(request) {

    return {
        "token": request.user.token,
        "tokenSecret": request.user.tokenSecret
    };
}

function server_setup(db) {
    var _this = this;

    var sendTitterComment = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(cred, amount, text, images, title, message) {
            var filename, data;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            // sends comment and
                            console.log("SendTitterComment");

                            if (!text) {
                                _context5.next = 13;
                                break;
                            }

                            _context5.next = 4;
                            return _titterPicture2.default.drawCommentP(text);

                        case 4:
                            filename = _context5.sent;
                            _context5.next = 7;
                            return _titterSender2.default.uploadP(cred, filename);

                        case 7:
                            data = _context5.sent;


                            try {
                                console.log(data);
                                data = JSON.parse(data);
                            } catch (e) {}

                            if (!data['errors']) {
                                _context5.next = 11;
                                break;
                            }

                            throw new Error("Upload failed, check twitter credentials ");

                        case 11:
                            images.unshift(data.media_id_string);
                            console.log("Sending images: ", images);

                        case 13:
                            _context5.next = 15;
                            return _titterSender2.default.replyP(cred, title + '\n' + message + ' Donated ' + amount + ' THX', images);

                        case 15:
                            return _context5.abrupt('return', _context5.sent);

                        case 16:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        return function sendTitterComment(_x5, _x6, _x7, _x8, _x9, _x10) {
            return _ref5.apply(this, arguments);
        };
    }();

    //wrioLogin = require('./wriologin')(db);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var p3p = require('p3p');
    app.use(p3p(p3p.recommended));
    app.use(_express2.default.static(__dirname + '/'));

    app.get('/iframe/', wrioAuth, function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(request, response) {
            var origin, user;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            origin = request.query.origin;

                            console.log('ORIGIN: ', origin);

                            _context3.prev = 2;
                            user = request.user;

                            if (!user.temporary) {
                                _context3.next = 6;
                                break;
                            }

                            throw new Error("Temporary user, allow to login");

                        case 6:
                            console.log("User found " + user);
                            response.render('create.ejs', {
                                "user": user,
                                "userID": request.query.id,
                                "host": decodeURIComponent(origin)
                            });

                            _context3.next = 14;
                            break;

                        case 10:
                            _context3.prev = 10;
                            _context3.t0 = _context3['catch'](2);

                            console.log("User not found:", _context3.t0);
                            response.render('create.ejs', {
                                "error": "Not logged in",
                                "user": undefined,
                                "host": decodeURIComponent(origin),
                                "userID": request.query.id
                            });

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[2, 10]]);
        }));

        return function (_x, _x2) {
            return _ref3.apply(this, arguments);
        };
    }());

    app.get('/logoff', function (request, response) {
        console.log("Logoff called");
        response.clearCookie('sid', {
            'path': '/',
            'domain': DOMAIN
        });
        response.send("OK");
        //response.redirect('/?create');
    });

    app.get('/callback', function (request, response) {
        console.log("Our callback called");
        response.render('callback', {});
    });

    app.get('/get_widget_id', function (request, response) {
        var login = request.query.login;
        var password = request.query.password;
        var query = request.query.query;

        if (!login || !password || !query) {
            return response.status(403).send("Wrong parameters");
        }

        (0, _phantom.startPhantom)(login, password, query).then(function (code) {
            response.send(code);
        });
    });

    app.get('/obtain_widget_id', wrioAuth, function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(request, response) {
            var query, user, code;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            query = request.query.query;

                            //console.log("DBG:",request.session);

                            if (query) {
                                _context4.next = 3;
                                break;
                            }

                            return _context4.abrupt('return', response.status(403).send("Wrong parameters"));

                        case 3:
                            _context4.prev = 3;
                            user = request.user;
                            _context4.next = 7;
                            return (0, _phantom.getSharedWidgetID)(user.wrioID, query);

                        case 7:
                            code = _context4.sent;


                            response.send(code);

                            _context4.next = 15;
                            break;

                        case 11:
                            _context4.prev = 11;
                            _context4.t0 = _context4['catch'](3);

                            dumpError(_context4.t0);
                            return _context4.abrupt('return', response.status(403).send("Error during execution of request"));

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this, [[3, 11]]);
        }));

        return function (_x3, _x4) {
            return _ref4.apply(this, arguments);
        };
    }());

    /* Request donate from webgold via api*/

    function requestDonate(from, to, amount) {
        return new Promise(function (resolve, reject) {
            var proto = 'https:';
            if (_wrio_nconf2.default.get('server:workdomain') == '.wrioos.local') {
                proto = 'http:';
            }
            var url = proto + '//webgold' + _wrio_nconf2.default.get('server:workdomain') + "/api/webgold/donate?amount=" + amount + "&to=" + to + "&from=" + from;

            var login = _wrio_nconf2.default.get("service2service:login");
            var pass = _wrio_nconf2.default.get("service2service:password");

            console.log(url);
            _superagent2.default.get(url).auth(login, pass).end(function (err, res) {
                if (err) {
                    if (!res) {
                        console.log(err);
                        return reject(err);
                    }
                    if (res.body) {
                        if (res.body.error) {
                            return reject(res.body.error);
                        }
                    }
                    return reject(err);
                }
                resolve(res.body);
            });
        });
    }

    app.post('/sendComment', (0, _multer2.default)().array('images[]'), wrioAuth, wrap(function () {
        var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(request, response) {
            var text, title, message, ssid, images, cred, amount, to, amountUser, fee, feepercent, donateResult, files, file, data;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            text = request.body.text;
                            title = request.body.title || '';
                            message = request.body.comment || '';
                            ssid = request.sessionID || '';
                            images = [];


                            console.log("Sending comment " + message);
                            cred = getTwitterCredentials(request);
                            amount = request.query.amount;
                            to = request.query.to;
                            amountUser = 0;
                            fee = 0;
                            feepercent = 0;
                            donateResult = {};

                            if (!(amount > 0 && to)) {
                                _context6.next = 24;
                                break;
                            }

                            console.log("Donation process has been started");
                            _context6.next = 17;
                            return requestDonate(request.user.wrioID, to, amount);

                        case 17:
                            donateResult = _context6.sent;

                            console.log("Donation result", donateResult);
                            amountUser = donateResult.amountUser / 100;
                            fee = donateResult.fee / 100;
                            feepercent = donateResult.feePercent;
                            _context6.next = 25;
                            break;

                        case 24:
                            amount = 0;

                        case 25:

                            console.log("got keys", cred);

                            if (!(request.files.length > 0 || text)) {
                                _context6.next = 41;
                                break;
                            }

                            // handle attached files
                            console.log("handling attached files:");
                            files = request.files;
                            _context6.t0 = regeneratorRuntime.keys(files);

                        case 30:
                            if ((_context6.t1 = _context6.t0()).done) {
                                _context6.next = 39;
                                break;
                            }

                            file = _context6.t1.value;
                            _context6.next = 34;
                            return _titterSender2.default.uploadP(cred, files[file].buffer);

                        case 34:
                            data = _context6.sent;

                            try {
                                data = JSON.parse(data);
                            } catch (e) {}
                            images.push(data.media_id_string);
                            _context6.next = 30;
                            break;

                        case 39:
                            _context6.next = 41;
                            return sendTitterComment(cred, amount, text, images, title, message);

                        case 41:
                            donateResult = {
                                "status": 'Done',
                                "donated": amount,
                                amountUser: amountUser,
                                fee: fee,
                                feePercent: feepercent,
                                callback: donateResult.callback
                            };

                            console.log("Donation result: ", donateResult);
                            response.send(donateResult);

                        case 44:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this);
        }));

        return function (_x11, _x12) {
            return _ref6.apply(this, arguments);
        };
    }()));

    app.use('/', _express2.default.static(_path2.default.join(__dirname, '..', '/hub/')));

    app.use(function (err, req, res, next) {
        dumpError(err);
        res.status(403).send("There was an error processing your request");
    });

    console.log("Titter server config finished");
};

module.exports = app; // For unit testing purposes