const express = require('express');
const router = express.Router();

const Profile = require('./profileModel');
const User = require('./userModel');
const mongoose = require('mongoose');

const checkAuth = require('./userAuthConfirm');

router.get('/', (req, res, next) => {
  // res.status(200).json({
  //   message: 'This is a customer-profile!'
  // });
  Profile.find()
  .select('_id firstName user')
  .populate('user', 'username email')
  .exec()
  .then( results => {
    //This commented out code if for when I wan to return particular repsonses
    responses = {
      count: results.length,
      profiles_num: results.map(result => {
        return {
          _id: result._id,
          firstName: result.firstName,
          user: result.user
        }
      })
    }
    console.log(results);
    res.status(200).json(results)
  })
  .catch( error => {
    res.status(500).json({
      error: error
    })
  })
});

//This creates a profile and associates it with a userId
router.post('/', (req, res, next) => {
  User.find({ _id: req.body.userId })
  .exec()
  .then( user => {
      if(!user) {
        return res.status(404).json({
          message: "User does not exist"
        });
      }

      const customerprofile = new Profile({
        _id: mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        user: req.body.userId
      });
      return  customerprofile.save()
      .then(user => {
        console.log(user);
        res.status(201).json({
          message: "Profile information successfully updated!",
          customerprofile: {
            _id: customerprofile._id,
            firstName: customerprofile.firstName,
            userId: user.user
          }
        })
      })

  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      error: error
    })
  });
});

router.get('/:profileId', (req, res, next) => {
  Profile.findById(req.params.profileId)
  .populate('user', 'username')
  .exec()
  .then(customerprofile => {
    if(!customerprofile) {
      return res.status(404).json({
        message: 'Profile NOT found!'
      })
    }
    res.status(200).json({
      customerprofile: customerprofile
    })
  })
  .catch(error => {
    res.status(500).json({
      error: error
    })
  });
})

router.patch('/:profileId', checkAuth, (req, res, next) => {
  const id = req.params.profileId;
  const updateOps = {};

  for (const opos of req.firstName) {
    updateOps[ops.propName] = ops.value;
  }

  Profile.update({ _id: id }, { $set : updateOps })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "Customer Profile Successfully updated!"
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      error: error
    })
  });
});

//This endpoint WILL be accessible by admin ONLY
router.delete('/:profileId', (req, res, next) => {
  const id = req.params.profileId;

  Profile.remove({_id: id })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "Profile Deleted",
      request: {
        type: 'POST',
        url: 'http://localhost:5000/api/v1/profile',
        body: { location: 'String' }
      }
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
});

module.exports = router;
