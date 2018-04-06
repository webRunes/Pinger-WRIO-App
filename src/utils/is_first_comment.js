const
  WidgetID = require('../dbmodels/widgetID'),
  defaultWidgetIdForArticleWithoutComments = '875721502196465664';

async function isFirstComment(articleUrl) {
  const
    widget = new WidgetID(),
    exist = await widget.get({query: articleUrl});

  return exist === null || exist.widgetId === defaultWidgetIdForArticleWithoutComments;
}

module.exports = isFirstComment;
