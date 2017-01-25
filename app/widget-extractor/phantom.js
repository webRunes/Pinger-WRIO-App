'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSharedWidgetID = exports.startPhantom = undefined;

var waitLoadingToFinish = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return delay(1000);

                    case 2:
                        console.log("Wait", loadInProgress);

                    case 3:
                        if (!loadInProgress) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 6;
                        return delay(50);

                    case 6:
                        _context.next = 3;
                        break;

                    case 8:
                        _context.next = 10;
                        return delay(1000);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function waitLoadingToFinish() {
        return _ref.apply(this, arguments);
    };
}();

var setupPhantom = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(phantom, page) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:

                        page.property('onConsoleMessage', function (msg) {
                            console.log(msg);
                        });

                        page.property('onLoadStarted', function () {
                            loadInProgress = true;
                            console.log('Loading started');
                        });

                        page.property('onLoadFinished', function () {
                            loadInProgress = false;
                            console.log('Loading finished');
                        });

                        _context2.next = 5;
                        return page.setting('userAgent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36');

                    case 5:
                        _context2.next = 7;
                        return page.setting('javascriptEnabled', true);

                    case 7:
                        _context2.next = 9;
                        return page.setting('loadImages', false);

                    case 9:
                        _context2.next = 11;
                        return page.setting('cookiesEnabled', true);

                    case 11:
                        //    await page.setting('javascriptEnabled', true);

                        console.log("Settings successfully setup");

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function setupPhantom(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

var loginTwitter = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(page, login, pass) {
        var status, r;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        console.log('Step 1 - Open Twitter Login page');
                        _context3.next = 3;
                        return page.open("https://twitter.com/login?lang=en");

                    case 3:
                        status = _context3.sent;

                        console.log(status);

                        _context3.next = 7;
                        return waitLoadingToFinish();

                    case 7:

                        console.log('Step 2 - Populate and submit the login form');
                        _context3.next = 10;
                        return page.evaluate(function (login, pass) {
                            console.log("Logging in");
                            document.getElementsByName("session[username_or_email]")[1].value = login;
                            document.getElementsByName("session[password]")[1].value = pass;
                            document.getElementsByClassName('submit')[1].click();
                            //  document.getElementsByClassName('flex-table-btn')[0].click();
                            return "ok";
                        }, login, pass);

                    case 10:
                        r = _context3.sent;

                        console.log(r);

                    case 12:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function loginTwitter(_x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}();

var loadTweets = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(page) {
        var content, result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        console.log("Step 3 - Wait for loading Twitter home page and extract the content");

                        _context4.next = 3;
                        return page.property('content');

                    case 3:
                        content = _context4.sent;


                        _fs2.default.writeFileSync('/tmp/page.html', content, { mode: '0755' });

                        _context4.next = 7;
                        return page.evaluate(function () {
                            console.log("Turbo");
                            var pageTweets = document.getElementsByClassName('js-tweet-text');
                            console.log("Tweets is", pageTweets);
                            console.log(pageTweets.length);
                            var result = new Array();
                            for (var i = 0; i < pageTweets.length; i++) {
                                result.push(pageTweets[i].innerHTML);
                            }
                            return result;
                        });

                    case 7:
                        result = _context4.sent;

                    case 8:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function loadTweets(_x6) {
        return _ref4.apply(this, arguments);
    };
}();

var createTimeline = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(page, url) {
        var status, content, r;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        status = page.open("https://twitter.com/settings/widgets/new/search");
                        _context5.next = 3;
                        return waitLoadingToFinish();

                    case 3:
                        _context5.next = 5;
                        return page.property('content');

                    case 5:
                        content = _context5.sent;

                        _fs2.default.writeFileSync('/tmp/sett.html', content, { mode: '0755' });

                        _context5.next = 9;
                        return page.evaluate(function (url) {

                            console.log("Creating widget for url");
                            document.getElementsByName("timeline_config[query]")[0].value = url;
                            var $formactions = document.getElementsByClassName('form-actions')[0].children[0];
                            $formactions.click();

                            return "ok";
                        }, url);

                    case 9:
                        r = _context5.sent;
                        _context5.next = 12;
                        return delay(8000);

                    case 12:
                        _context5.next = 14;
                        return page.evaluate(function () {
                            console.log("Waiting for code to appear");

                            var $code = document.getElementById('code');
                            if ($code) {
                                var retval = $code.value;
                                console.log("Got value");
                                return retval;
                            }

                            return "failure";
                        });

                    case 14:
                        r = _context5.sent;
                        return _context5.abrupt('return', r);

                    case 16:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function createTimeline(_x7, _x8) {
        return _ref5.apply(this, arguments);
    };
}();

var startPhantom = exports.startPhantom = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(login, pass, url) {
        var page, code;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        _context6.next = 3;
                        return _phantom2.default.create();

                    case 3:
                        phInstance = _context6.sent;
                        _context6.next = 6;
                        return phInstance.createPage();

                    case 6:
                        page = _context6.sent;
                        _context6.next = 9;
                        return setupPhantom(phInstance, page);

                    case 9:
                        _context6.next = 11;
                        return loginTwitter(page, login, pass);

                    case 11:
                        _context6.next = 13;
                        return waitLoadingToFinish();

                    case 13:
                        _context6.next = 15;
                        return loadTweets(page);

                    case 15:
                        _context6.next = 17;
                        return createTimeline(page, url);

                    case 17:
                        code = _context6.sent;

                        console.log("Return value", code);

                        page.close();
                        _context6.next = 22;
                        return phInstance.exit();

                    case 22:
                        return _context6.abrupt('return', extractID(code));

                    case 25:
                        _context6.prev = 25;
                        _context6.t0 = _context6['catch'](0);

                        dumpError(_context6.t0);
                        phInstance.exit();

                    case 29:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[0, 25]]);
    }));

    return function startPhantom(_x9, _x10, _x11) {
        return _ref6.apply(this, arguments);
    };
}();

var obtainWidgetID = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(userID, query) {
        var helper, widget, workAccount, wID;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        helper = new _helperAccount2.default();
                        widget = new _widgetID2.default();
                        _context7.next = 4;
                        return helper.getLeastUsedAccount();

                    case 4:
                        workAccount = _context7.sent;

                        console.log("Obtaing user id with ", workAccount.id, " account");
                        _context7.next = 8;
                        return startPhantom(workAccount.id, workAccount.password, query);

                    case 8:
                        wID = _context7.sent;
                        _context7.next = 11;
                        return widget.create(wID, userID, query);

                    case 11:
                        return _context7.abrupt('return', wID);

                    case 12:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function obtainWidgetID(_x12, _x13) {
        return _ref7.apply(this, arguments);
    };
}();

var getSharedWidgetID = exports.getSharedWidgetID = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(userID, query) {
        var helper, widget, existingID;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.prev = 0;

                        console.log("Getting widget ID from shared pool");

                        helper = new _helperAccount2.default();
                        widget = new _widgetID2.default();
                        _context8.next = 6;
                        return widget.get({ 'query': query });

                    case 6:
                        existingID = _context8.sent;

                        if (!existingID) {
                            _context8.next = 11;
                            break;
                        }

                        return _context8.abrupt('return', existingID.widgetId);

                    case 11:
                        _context8.next = 13;
                        return obtainWidgetID(userID, query);

                    case 13:
                        return _context8.abrupt('return', _context8.sent);

                    case 14:
                        _context8.next = 19;
                        break;

                    case 16:
                        _context8.prev = 16;
                        _context8.t0 = _context8['catch'](0);

                        dumpError(_context8.t0);

                    case 19:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this, [[0, 16]]);
    }));

    return function getSharedWidgetID(_x14, _x15) {
        return _ref8.apply(this, arguments);
    };
}();

var _phantom = require('phantom');

var _phantom2 = _interopRequireDefault(_phantom);

var _wriocommon = require('wriocommon');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _helperAccount = require('../dbmodels/helperAccount.js');

var _helperAccount2 = _interopRequireDefault(_helperAccount);

var _widgetID = require('../dbmodels/widgetID.js');

var _widgetID2 = _interopRequireDefault(_widgetID);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by michbil on 23.04.16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var dumpError = _wriocommon.utils.dumpError;


var sitepage = null;
var phInstance = null;

var loadInProgress = false;

function delay(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            return resolve();
        }, ms);
    });
}

function extractID(code) {
    var regex = /data-widget-id="([0-9]+)"/g;
    var match = regex.exec(code);
    if (match) {
        return match[1];
    }
}

;