const should = require('should');
const titterPicture = require('../src/titter-picture.js');

describe('titter-picture test', () => {
    before(() => {

    });
    it("Shoud return correct filename", () => {
        titterPicture.drawComment('test', (err, filename) => {
            should.exist(filename);
        });
    })
});