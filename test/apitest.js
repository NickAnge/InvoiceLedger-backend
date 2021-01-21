let chai = require("chai");
let chaiHttp = require("chai-http");
var should = chai.should();
chai.use(chaiHttp);
let server = require("../server");



var User = require("../User/model")

describe("Welcome Message", () => {
    describe("/GET Welcome Message", () => {
        it("it should GET the welcome message", (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.text.should.equal("Welcome to Delivery Ledger")
                    done();
                });
        });
    });
});


// describe("Users", () => {
//     let token;
//     describe("Autheticate users", () => {
//         it("should login user,", (done) => {
//             chai.request(server)
//                 .post('/auth/login')
//                 .send({
//                     "email": "test@email.gr",
//                     "password": "tester",
//                 }).end((err, res) => {
//                     res.body.should.have.property('token');
//                     res.should.have.status(201)
//                     token = res.body.token;
//                     done();
//                 })

//         });
//     });

//     describe("Authenticated URLS", () => {
//         it("Should /GET all users", (done) => {
//             chai.request(server)
//                 .get("/users")
//                 .set('Authorization', token)
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     done();
//                 })
//         })
//     })

//     /*
//     * ADD mpre api tests in the future
//     */
// });

