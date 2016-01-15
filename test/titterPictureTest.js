import request from 'supertest';
import assert from 'assert';
import should from 'should';
import titterPicture from '../src/titter-picture.js';


describe('titter-picture test', () => {
   before(() => {

   });
    it("Shoud return correct filename", () => {
        titterPicture.drawComment('test', (err, filename) => {
            should.exist(filename);
        });
    })
});