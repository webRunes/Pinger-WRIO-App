/**
 * Created by michbil on 26.04.16.
 */

import request from 'supertest';
import assert from 'assert';
import should from 'should';
import {db} from 'wriocommon';
import helperAccount from '../src/dbmodels/helperAccount.js';


describe('test data models', () => {
    before(async () => {
        await db.init();
    });
    it("Shoud return correct filename", async () => {
        var acc = new helperAccount();
        var a = await acc.getLeastUsedAccount();
      //  should.exist(a.id);
       // should.exist(a.password);
       // should.exist(a.records);
    })
});