const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

//The User and Profile models are called here due to the ONE_to_ONE association between the schemas
const User = require('./user');
const CustomerProfile = require('./profile');
const Token = require('./token');

//nodemailer package is used for email verification on User sign up
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const verifyToken = require('./verifyToken');

//This route is used to get all Users on the platform. This endpoint will eventually be moved under Admin routes.
router.get('/', (req, res, next) => {

  User.find()
  .select('_id username email isVerified profile')

  .populate('profile')
  .exec()
  .then( results => {

    responses = {
      count: results.length,
      profiles_num: results.map(result => {
        return {
          _id: result._id,
          username: result.username,
          email: result.email,
          isVerified: result.isVerified,
          profile: result.profile

        }
      })
    }
    console.log(results);
    res.status(200).json(responses)
  })
  .catch( error => {
    res.status(500).json({
      error: error
    })
  })
});

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
          .exec()
          .then(user => {
              if (user.length >= 1) {
                return res.status(409).json({
                  message: "Email already exists!"
                });
              } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                  if (err) {
                    return res.status(500).json({
                      error: err
                    });
                  } else {
                    const user = new User({
                      _id: mongoose.Types.ObjectId(),
                      username: req.body.username,
                      email: req.body.email,
                      password: hash
                    })
                    user
                        .save()
                        .then(result => {
                          console.log(result);


                          const token = new Token({ _id: user._id, token: jwt.sign(
                           {
                             email: req.body.email
                           },
                           process.env.JWT_KEY,
                           {
                               expiresIn: "1h"
                           }) })

                           .save()

                           .then(result => {
                             console.log(result.token)
                             var options = {
                                             auth: {
                                               api_key: process.env.SENDGRID_API_KEY
                                             }
                                           }
                             var client = nodemailer.createTransport(sgTransport(options));
                             var email = {
                                           from: 'info@coope.com.ng',
                                           to: user.email,
                                           subject: 'Hello',
                                           text: 'Please verify your account by clicking the link: \nhttp:\/\/' +
                                           req.headers.host + '\/api\/v1\/user\/confirmation\/' + result.token + '.\n'

                                         };
                                         client.sendMail(email, function(err, info){
                                                           if (err ){
                                                             return res.status(500).json({
                                                                                                     msg: err.message
                                                                                                   });
                                                           }
                                                           res.status(201).json({ message: `Almost finished... A verification email has been sent to ${user.email}. Please, Click the link to verify your email. We need to confirm your email address. To complete signup, please click the link in the email we just sent you.`});
                                                       });

                           })

                        })
                        .catch(err => {
                          console.log(err)
                          res.status(500).json({
                            error: err
                          });
                      });

                  }

                });
                }
            });
});

router.post('/login', (req, res, next) => {

  User.find({email: req.body.email})
        .exec()
        .then(user => {
          if (user.length < 1){
            return res.status(401).json({
              message: "You shall NOT pass!"
            });
          }
          bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err){
              return res.status(401).json({
                message: 'Auth Failed'
              });
            }
            if (!user.isVerified) {
              return res.status(401).json({
                type: 'not-verified',
                msg: `Almost finished... A verification email was sent to ${user.email}. Please, Click the link to verify your email. We need to confirm your email address before you can login. To complete signup, please click the link in the email we sent you. Click this link to resend another link to verify email` })
              }
            if (result) {
              const token = jwt.sign({
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                expiresIn: "12h"
              }
            )
              console.log(user);
              return res.status(200).json({
                message: 'Auth Successful!',
                _id: user[0]._id,
                username: user[0].username,
                email: user[0].email,
                token: token
              });
            }
            res.status(401).json({
              message: 'Auth Failed'
            });
          })
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
});

//add a delete user method eventually for admin

router.delete('/:userId', (req,res, next) =>{
  const id = req.params.userId;

  User.remove({ _id : id })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "User account Deleted",
      request: {
        type: 'POST',
        url: 'http://localhost:5000/api/v1/customerprofile',
        body: { location: 'String' }
      }
    })
  })
  .catch(error =>{
    res.status(500).json({
      error: error
    })
  })
});

module.exports = router;
