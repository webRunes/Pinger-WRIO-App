const app = require("../src/index.js");
const request = require('supertest');


var stdout_write = process.stdout._write,
    stderr_write = process.stderr._write;

process.stdout._write = stdout_write;
process.stderr._write = stderr_write;

var ready = false;
app.ready = function() {
    ready = true;
};


describe("API unit tests", function() {
    before(function (done) {
        setInterval(function() {
            if (ready) {
                console.log("App ready, starting tests");
                done();
                clearInterval(this);
            }

        }, 1000);
    });
    it ("should return default page",function (done){
        request(app)
            .get('/')
            .expect(200,done);
    });

    it("should fail with empty credentials", function (done) {
        var postdata = {
            twitterCreds: {
                access_token:"",
                access_secret: "",
                query:"test_query"
            }

        };
        request(app)
            .post('/api/search')
            .send(postdata)
            .expect(400,done);

    });

    it("should fail with empty body", function (done) {
        var postdata = {};
        request(app)
            .post('/api/search')
            .send(postdata)
            .expect(400,done);

    });

    it("should fail with empty body", function (done) {
        var postdata = {};
        request(app)
            .post('/api/reply')
            .send(postdata)
            .expect(400,done);

    });

    it("should fail with empty body", function (done) {
        var postdata = {};
        request(app)
            .post('/api/replyAll')
            .send(postdata)
            .expect(400,done);

    });
});

