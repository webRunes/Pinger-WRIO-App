const
  request = require('superagent'),
  obtainWidgetID = require('./widget-extractor/obtain_widget_id'),
  domain = () => process.env.DOMAIN,
  protocol = () => (process.env.NODE_ENV == 'development' ? 'https:' : ''),
  nconf = require('./wrio_nconf');

async function updateCommentId(wrioID, url) {
  const
    commentId = await obtainWidgetID(wrioID, url);

  return request
    .post(`${protocol()}//storage.${domain()}/api/update_comment_id`)
    .set('Accept', 'application/json')
    .auth(nconf.get('service2service:login'), nconf.get('service2service:password'))
    .send({
      url: url,
      commentId: commentId
    });
};

module.exports = updateCommentId;
