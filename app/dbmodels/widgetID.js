'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by michbil on 26.04.16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _wriocommon = require('wriocommon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dbInst = _wriocommon.db.db;

var WidgetID = function () {
    function WidgetID() {
        _classCallCheck(this, WidgetID);

        this.widgets = dbInst.db.collection('titterWidgetID');
    }

    _createClass(WidgetID, [{
        key: 'create',
        value: function create(widgetId, userID, q) {
            var _this = this;

            var that = this;
            var invoice_data = {
                widgetId: widgetId,
                userId: userID,
                query: q
            };

            return new Promise(function (resolve, reject) {
                _this.widgets.insertOne(invoice_data, function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
    }, {
        key: 'get',
        value: function get(mask) {
            var _this2 = this;

            var that = this;

            return new Promise(function (resolve, reject) {

                _this2.widgets.findOne(mask, function (err, data) {
                    if (err) {
                        _winston2.default.error("Error while searching invoice");
                        reject(err);
                        return;
                    }
                    if (!data) {
                        return resolve(null);
                    }
                    that.invoice_id = data._id;
                    resolve(data);
                });
            });
        }
    }]);

    return WidgetID;
}();

exports.default = WidgetID;