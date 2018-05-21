const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Language = require('../models/language')

/* POST запросы */
router.post('/', (req, res, next) => {
  const languageId = mongoose.Types.ObjectId()
  const language = Language({
    _id: languageId,
    name: req.body.name,
    title: req.body.title,
    flag: req.body.flag
  })
  language.save()
    .then(result => {
      res.status(201).json({
        message: 'Language created!',
        language: result
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      })
    })
})

router.post('/levels/:language_id', (req, res, next) => {
  const level = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    order: req.body.order
  }
  Language.update({ _id: req.params.language_id }, { $push: { levels: level } }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Level pushed into language with id ' + req.params.language_id,
        level: level
      })
    }
  })
})

router.post('/lessons/:level_id', (req, res, next) => {
  const lesson = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    title: req.body.title,
    order: req.body.order
  }
  Language.update({ 'levels._id': req.params.level_id }, { $push: { 'levels.$.lessons': lesson } }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Lesson pushed into level with id ' + req.params.level_id,
        lesson: lesson
      })
    }
  })
})

router.post('/tasks/:level_id/:lesson_id', (req, res, next) => {
  const task = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    title: req.body.title,
    order: req.body.order
  }
  Language.update({}, { $push: { 'levels.$[i].lessons.$[j].tasks': task } }, { arrayFilters: [{ 'i._id': mongoose.Types.ObjectId(req.params.level_id) }, { 'j._id': mongoose.Types.ObjectId(req.params.lesson_id) }] }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Task pushed into lesson with id ' + req.params.lesson_id,
        task: task
      })
    }
  })
})

/* */

/* GET запросы*/

router.get('/', (req, res, next) => {
  Language.find({})
    .lean()
    .exec((err, languages) => {
      if (!err) {
        res.status(200).json({
          languages
        })
      }
    })
})

router.get('/:language_id', (req, res, next) => {
  Language.findOne({ _id: req.params.language_id }).lean()
    .exec((err, language) => {
      if (!err) {
        if (language) {
          res.status(200).json(language)
        } else {
          res.status(404).json({
            message: 'Language not found'
          })
        }
      } else {
        res.status(200).json({
          error: err.message
        })
      }
    })
})

router.get('/levels/:language_id', (req, res, next) => {
  Language.findOne({ _id: req.params.language_id }, 'levels').lean()
    .exec((err, level) => {
      if (!err) {
        if (level) {
          res.status(200).json(level)
        } else {
          res.status(404).json({
            message: 'Level not found'
          })
        }
      } else {
        res.status(200).json({
          error: err.message
        })
      }
    })
})

router.get('/lessons/:level_id', (req, res, next) => {
  Language.aggregate([
    { $match: {"levels._id": mongoose.Types.ObjectId(req.params.level_id)}}, 
    { $project: {lessons: "$levels.lessons"}}
  ], (err, result) => {
    if (!err) {
      res.status(200).json({
        lessons: result[0].lessons[0]
      })
    }else {
      res.status(500).json({
        error: err.message
      })
    }
  })
})

router.get('/tasks/:lesson_id', (req, res, next) => {
  Language.aggregate([
    { $match: {"levels.lesson._id": mongoose.Types.ObjectId(req.params.lesson_id)}}, 
    { $project: {tasks: "$levels.lessons"}}
  ], (err, result) => {
    if (!err) {
      res.status(200).json({
        tasks: result
      })
    }else {
      res.status(500).json({
        error: err.message
      })
    }
  })
})

/* */

/* DELTE */
router.delete('/', (req, res) => {
  Language.remove({}).then(resp => {
    res.status(201).json({
      message: 'DB Cleared!'
    })
  })
})

module.exports = router