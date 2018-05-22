const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')

router.get('/', (req, res, next) => {
  User.find().lean()
    .exec( (err, users) => {
      if (!err) {
        res.status(200).json(users)
      }else {
        res.status(500).json({
          error: err.message
        })
      }
    })
})

router.get('/:user_id', (req, res, next) => {
  User.findOne({_id: req.params.user_id}).lean()
    .exec( (err, user) => {
      if (!err) {
        if (user) {
          res.status(200).json(user)
        }else {
          res.status(404).json({
            message: 'User not found'
          })
        }
      }else {
        res.status(500).json({
          error: err.message
        })
      }
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

router.delete('/:user_id', (req, res, next) => {
  User.remove({ '_id': req.params.user_id}).then(resp => {
    res.status(201).json({
      message: 'User Cleared!'
    })
  })
})

module.exports = router