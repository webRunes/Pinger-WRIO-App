const logger = require('winston');
const db = require('wriocommon').db.getInstance();

class DeferredTweet {

    constructor () {
        this.widgets = db.collection('deferredTweets');
        this.record_id = null;
    }

    async create(associatedTx,amount,text,title,message,creds) {
        let invoice_data = {
            associatedTx,amount,title,message,text,creds
        };
        let invoice = await this.widgets.insertOne(invoice_data);
        this.record_id = invoice_data._id;
        return invoice_data._id;
    }

    async get(mask) {
        let data = await this.widgets.findOne(mask);
        this.record_id = data._id;
        return data;

    }
    async getAll(query) {
        query = query || {};
        let data = await this.widgets.find(query).sort({'timestamp':-1});
        return data.toArray();
    }

    async update (invoice_data) {
        if (this.record_id == null) {
            throw ("Record not initialized not defined, please use get or create method first");
        }
        await this.widgets.updateOne({_id:this.record_id },{$set: invoice_data});
    }


}

module.exports = DeferredTweet;