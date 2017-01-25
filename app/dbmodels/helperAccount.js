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

var HelperAccount = function () {
    function HelperAccount() {
        _classCallCheck(this, HelperAccount);

        this.widgets = dbInst.db.collection('titterHelperAccounts');
    }

    _createClass(HelperAccount, [{
        key: 'create',
        value: function create(id, pass) {
            var _this = this;

            var that = this;
            var invoice_data = {
                id: id,
                password: pass,
                records: 0
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
            _winston2.default.debug(nonce);

            return new Promise(function (resolve, reject) {

                _this2.widgets.findOne(mask, function (err, data) {
                    if (err) {
                        _winston2.default.error("Error while searching invoice");
                        reject(err);
                        return;
                    }
                    if (!data) {
                        _winston2.default.error('No invoice found');
                        reject('Invoce not found');
                        return;
                    }
                    that.invoice_id = data._id;
                    resolve(data);
                });
            });
        }
    }, {
        key: 'getLeastUsedAccount',
        value: function getLeastUsedAccount() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {

                _this3.widgets.find({}).sort({ 'records': -1 }).toArray(function (err, data) {
                    if (err) {
                        _winston2.default.error("Error while searching invoice");
                        reject(err);
                        return;
                    }
                    if (!data) {
                        _winston2.default.error('No invoice found');
                        reject('Invoce not found');
                        return;
                    }
                    resolve(data[0]);
                });
            });
        }
    }]);

    return HelperAccount;
}();

exports.default = HelperAccount;