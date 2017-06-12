/**
 * Created by michbil on 26.04.16.
 */

const should = require('should');
const {init} = require('wriocommon').db;
const helperAccount = require('../src/dbmodels/helperAccount.js');


describe('test data models', () => {
    before(async () => {
        await init();
    });
    it("Shoud return correct filename", async () => {
        var acc = new helperAccount();
        var a = await acc.getLeastUsedAccount();
      //  should.exist(a.id);
       // should.exist(a.password);
       // should.exist(a.records);
    })
});