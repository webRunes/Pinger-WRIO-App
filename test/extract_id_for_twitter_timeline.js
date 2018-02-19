const
    assert = require('assert'),
    db = require('wriocommon').db,
    //startPhantom = require('../src/widget-extractor/phantom').startPhantom,
    nconf = require('nconf');

describe('Create timeline search request', () => {

    before(done => {
        nconf.argv().file({ file: './config.json' });
        db.init(nconf).then(() => done());
    })

    it('should return id', done => {
        done();
        //const
        //    id = startPhantom(login, password, url);

        //assert(id.length)
    })
})
