const
  assert = require('assert'),
  db = require('wriocommon').db,
  //nconf = require('../src/wrio_nconf'),
  isFirstComment = require('../src/utils/is_first_comment');

describe('isFirstComment', () => {
    before(async () => {
        //await db.init(nconf);
        await db.init();
    });

    it('Existing article with not default widgetId should return false', done => {
      isFirstComment('https://wr.io/474365383130/Untitled11/index.html').then(result =>
        done(
          result
            ? 'This article already has comments'
            : undefined
        )
      );
    });

    it('There are no comments for fake article', done => {
      isFirstComment('https://wrong.fake.url').then(result =>
        done(
          result
            ? undefined
            : 'Should not exist any comments for fake url'
        )
      );
    });
});
