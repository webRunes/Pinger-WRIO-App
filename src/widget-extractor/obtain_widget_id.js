const helperAccount = require('../dbmodels/helperAccount');
const widgetID = require('../dbmodels/widgetID');
const {startPhantom} = require('./phantom');

async function obtainWidgetID(userID, query) {
  // hack to prevent different links for http and https,
  // always overwrite protocol to https://
  query = query.replace('http://','https://');

  var helper = new helperAccount();
  var widget = new widgetID();

  var workAccount = await helper.getLeastUsedAccount();
  console.log("Obtaing user id with ", workAccount.id, " account");
  var wID = await startPhantom(workAccount.id, workAccount.password, query);

  await widget.create(wID, userID, query);
  return wID;
}

module.exports.obtainWidgetID = obtainWidgetID;
