const express = require('express');
const User = require('./model')
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const config = require("../config/main")
const Op = Sequelize.Op;

/*
*   GET /users route to retrive all the users.
*/

exports.showUsers = function (req, res) {
    User.findAll()
        .then(users => {
            return res.status(200).json({
                message: users
            });
        })
        .catch(err => console.log(err.message))
}

/*
*   POST /auth/register route to create a new user.
*/

exports.register = function (req, res) {
    console.log(req)
    if (req.body.email == undefined || req.body.username == undefined) {
        res.status(400).json({
            message: "Email undefined"
        })
    }
    else {
        User.findOne({
            where: {
                [Op.or]: [
                    { email: req.body.email },
                    { username: req.body.username }]
            }
        })
            .then(user => {
                if (user) {
                    return res.status(409).json({
                        User: user,
                        message: "This email or Username already exists"
                    });
                }
                else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        }
                        else {
                            console.log("User created");
                            const newUser = new User({
                                username: req.body.username,
                                password: hash,
                                email: req.body.email
                            });
                            let { username, password, email } = newUser;
                            User.create({
                                username,
                                password,
                                email
                            })
                                .then(result => {
                                    res.status(201).json({
                                        message: "User created",
                                        user: result
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        err: err
                                    });
                                });
                        }
                    });
                }
            });
    }

}

/*
*   POST /auth/login route to get credentials from the user.
*/
exports.login = function (req, res) {
    if (req.body.email == undefined) {
        res.status(400).json({
            message: "Email undefined"
        })
    }
    User.findOne({
        where: { email: req.body.email }
    })
        .then(user => {
            if (user == null) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return req.status(401).json({
                        message: "Auth failed,Password is Incorrect"
                    });
                }
                if (result) {
                    const payload = {
                        id: user.id,
                        email: user.email
                    };
                    jwt.sign(payload, config.secret, { expiresIn: 36000 }, (err, token) => {
                        if (err) {
                            res.status(500).json(
                                {
                                    error: "Error signing token",
                                    raw: err
                                })
                        }
                        else if (token) {
                            console.log(token)
                            res.status(201).json({
                                success: "Auth Successful",
                                token: `Bearer ${token}`
                            });
                        }
                    });
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

/*
*   GET /users/{user_id} route to get info from a user.
*/
exports.findUser = function (req, res) {
    User.findOne({
        where: { id: req.params.user_id }
    }).then(user => {
        if (user) {
            res.status(200).json({
                auth: true,
                username: user.username,
                email: user.email,
                password: user.password,
                message: 'user found in db',
            })
        }
        else {
            res.status(422).json({ error: "No user was found in db" });
        }
    }).catch((error) => {
        console.error('problem communicating with db');
        res.status(500).send(error);
    });
}

/*
*   Delete /users/{user_id} route to delete  a user.
*/
exports.delete = function (req, res) {
    User.destroy({
        where: {
            id: req.params.user_id,
        },
    })
        .then((userInfo) => {
            if (userInfo === 1) {
                console.log('user deleted from db');
                res.status(200).send('user deleted from db');
            } else {
                console.error('user not found in db');
                res.status(422).send('no user with that username to delete');
            }
        })
        .catch((error) => {
            console.error('problem communicating with db');
            res.status(500).send(error);
        });
}


/*
*   Search /users/{user_id} route to find  a user.
*/

exports.update = function (req, res) {
    User.findOne({
        where: {
            id: req.params.user_id,
        },
    }).then((userInfo) => {
        if (userInfo != null) {
            console.log('user found in db');
            userInfo
                .update({
                    username: (req.body.username == undefined) ? userInfo.username : req.body.username,
                    email: (req.body.email == undefined) ? userInfo.email : req.body.email
                })
                .then(() => {
                    console.log('user updated');
                    res.status(200).send({ auth: true, message: 'user updated' });
                });

        } else {
            console.error('no user exists in db to update');
            res.status(422).send('no user exists in db to update');
        }
    });
}
