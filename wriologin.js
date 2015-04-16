/**
 * Created by mich.bil on 16.04.15.
 */
/**
 * Created by mich.bil on 16.04.15.
 */

var nconf = require("./wrio_nconf.js").init();
var mysql = require('mysql');

MYSQL_HOST = nconf.get("db:host");
MYSQL_USER = nconf.get("db:user");
MYSQL_PASSWORD = nconf.get("db:password");
MYSQL_DB = nconf.get("db:dbname");
DOMAIN= nconf.get("db:workdomain");

var connection = mysql.createConnection({
    host     : MYSQL_HOST,
    user     : MYSQL_USER,
    password : MYSQL_PASSWORD
});

connection.query('USE '+MYSQL_DB);

// used to deserialize the user
function deserialize(id, done) {
    console.log("Deserializing user by id="+id)
    connection.query("select * from `webRunes_Login-Twitter` where userID ="+id,function(err,rows){
        if (err) {
            console.log("User not found",err);
            done(err);
            return;
        }

        console.log("USere deserialized "+id)
        done(err, rows[0]);
    });
};

function loginWithSessionId(ssid,done) {
    match = ssid.match(/^[-A-Za-z0-9+/=_]+$/m);
    if (!match) {
        console.log("Wrong ssid");
        done("Error");
        return
    }
    q = "select * from sessions where session_id =\""+ssid+"\"";
    console.log(q);
    connection.query(q,function(err,rows){
        if (err) {
            console.log("User not found",err);
            done(err);
            return;
        }
        console.log("Session deserialized "+ssid, rows[0]);
        data = JSON.parse(rows[0].data);
        user = data.passport.user;
        console.log("Deserializing user",user);
        if (user != undefined) {
            deserialize(user,done);
        } else {
            done("Wrong cookie")
        }

        done(err, rows[0]);
    });
}

function getTwitterCredentials(sessionId,done) {

    loginWithSessionId(sessionId,function callback(err,res) {
        if (err) {
            console.log("Error executing request");
        } else {
            if (res.token && res.tokenSecret) {
                done(null,{"token":res.token,"tokenSecret":res.tokenSecret})
            } else {
                done("No login with twitter");
            }
        }
    });

}


/*

 */
module.exports.loginWithSessionId = loginWithSessionId;
module.exports.getTwitterCredentials = getTwitterCredentials;
