const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')

router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'All ok!'
  })
})

router.post('/', (req, res, next) => {
  User.findOne({ email: req.body.email }).exec()
    .then(user => {

      if (user) {
        res.status(409).json({
          error: 'User with this email has already exist!'
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {

          if (err) {
            res.status(500).json({
              error: err.message
            })
          } else {
            const userId = mongoose.Types.ObjectId()
            const user = User({
              _id: userId,
              name: req.body.name,
              email: req.body.email,
              password: hash,
              role: req.body.role
            })
            user.save()
              .then(result => {
                res.status(201).json({
                  message: 'User created!',
                  user: result
                })
              })
              .catch(err => {
                console.log(err)
                res.status(500).json({
                  error: err.message
                })
              })
          }

        })
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      })
    })
})

router.delete('/', (req, res, next) => {
  User.remove({}).then(resp => {
    res.status(201).json({
      message: 'DB Cleared!'
    })
  })
})

module.exports = router