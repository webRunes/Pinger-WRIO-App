import nconf from 'nconf';
import logger from 'winston';

var exports = module.exports = {};


exports.init = function(express) {
    var app = express();
    var bodyParser = require('body-parser');
    // Add headers
    app.use(function(request, response, next) {
        //console.log(request);
        var host = request.get('origin');
        if (host == undefined) host = "";

        var domain = nconf.get("db:workdomain");

        domain = domain.replace(/\./g,'\\.')+'$';
        logger.log('silly',domain);

        if (host.match(new RegExp(domain,'m'))) {
            response.setHeader('Access-Control-Allow-Origin', host);
            logger.log("debug","Allowing CORS for webrunes domains");
        } else {
            logger.log("debug",'host not match');
        }

        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        response.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    return app;
};
