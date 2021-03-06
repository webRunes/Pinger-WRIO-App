/**
 * Created by michbil on 26.04.16.
 */

const logger = require('winston');


class HelperAccount {

    constructor () {
        const db = require('wriocommon').db.getInstance();
        this.widgets = db.collection('titterHelperAccounts');
    }

    create(id,pass) {
        var that = this;
        let invoice_data = {
           id:id,
           password: pass,
           records: 0
        };

        return new Promise((resolve, reject) => {
            this.widgets.insertOne(invoice_data,function(err,res) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });

    }

    get(mask) {
        var that=this;
        logger.debug(nonce);

        return new Promise((resolve,reject) => {

            this.widgets.findOne(mask,function (err,data) {
                if (err) {
                    logger.error("Error while searching invoice");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.error('No invoice found');
                    reject('Invoce not found');
                    return;
                }
                that.invoice_id = data._id;
                resolve(data);
            });
        });
    }

    getLeastUsedAccount() {
        return new Promise((resolve,reject) => {

            this.widgets.find({}).sort({'records':-1}).toArray(function (err,data) {
                if (err) {
                    logger.error("Error while searching invoice");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.error('No invoice found');
                    reject('Invoce not found');
                    return;
                }
                resolve(data[0]);
            });
        });
    }

}

module.exports = HelperAccount;