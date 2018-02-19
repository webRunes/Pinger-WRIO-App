const
    assert = require('assert'),
    db = require('wriocommon').db,
    startPhantom = require('../src/widget-extractor/phantom').startPhantom,
    login = 'aaa',
    password = 'bbb',
    url = 'http://ccc.cc',
    nconf = require('nconf');

describe('Create timeline search request', () => {

    before(done => {
        nconf.argv().file({ file: './config.json' });
        db.init(nconf).then(() => done());
    })

    it('should return id', () => {
        const
            id = startPhantom(login, password, url);

        assert(id.length)
    })
})
