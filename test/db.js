const
    assert = require('assert'),
    db = require('wriocommon').db,
    nconf = require('../src/wrio_nconf');

describe('Check wriocommon.db', () => {

    it('getInstance() should work after init()', done => {
        db.init(nconf).then(() => {
            assert(typeof db.getInstance() === 'object');
            done();
        });
    })

})
