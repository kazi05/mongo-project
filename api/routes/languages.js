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

router.post('/collection', (req, res, next) => {
  const collection = req.body
  const levels = {}

  collection.levels.forEach((level, index) => {
    level.lessons.forEach((lesson, lessonI) => {
      console.log(`Lesson ${lessonI} of level ${index} ---------` + lesson)
      lesson.tasks.forEach((task, taskI) => {
        console.log(`Task ${taskI} of lesson ${lessonI} of level ${index} ` + task)
        console.log(typeof (task))
      });
    });
  });

  res.status(201).json({
    message: 'ok'
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

router.get('/level/:level_id', (req, res, next) => {
  Language.findOne({ 'levels._id': req.params.level_id }, { 'levels': 1, '_id': 0 }).lean()
    .then(level => {
      if (level) {
        level.levels.map(arr => {
          if (arr._id == req.params.level_id) {
            res.status(200).json(arr)
          }
        })
      } else {
        res.status(404).json({
          message: 'Level not found :('
        })
      }
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).json({
        error: err.message
      })
    })
})

router.get('/lessons/:level_id', (req, res, next) => {
  Language.aggregate([
    { $match: { "levels._id": mongoose.Types.ObjectId(req.params.level_id) } },
    { $project: { lessons: "$levels.lessons" } }
  ], (err, result) => {
    if (!err) {
      res.status(200).json({
        lessons: result[0].lessons[0]
      })
    } else {
      res.status(500).json({
        error: err.message
      })
    }
  })
})

router.get('/tasks/:lesson_id', (req, res, next) => {
  Language.aggregate([
    { $match: { "levels.lesson._id": mongoose.Types.ObjectId(req.params.lesson_id) } },
    { $project: { tasks: "$levels.lessons" } }
  ], (err, result) => {
    if (!err) {
      res.status(200).json({
        tasks: result
      })
    } else {
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

router.delete('/:language_id', (req, res, next) => {
  Language.remove({ _id: req.params.language_id }).then(result => {
    res.status(201).json({
      message: 'Language deleted!'
    })
  })
})

router.delete('/levels/:level_id', (req, res, next) => {
  Language.update({}, { $pull: { 'levels': { '_id': mongoose.Types.ObjectId(req.params.level_id) } } }, (err, succes) => {
    if (err) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Level deleted!'
      })
    }
  })
})

router.delete('/lessons/:lesson_id', (req, res, next) => {
  Language.update({}, { $pull: { 'levels.0.lesson': { '_id': mongoose.Types.ObjectId(req.params.lesson_id) } } }, (err, succes) => {
    if (err) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Lesson deleted!'
      })
    }
  })
})

/* */

/* UPDATE */
router.put('/levels/:level_id', (req, res, next) => {
  const updateRequest = {}
  for (key in req.body) {
    let keyString = 'levels.$[i].' + key
    updateRequest[keyString] = req.body[key]
  }
  Language.update({}, { $set: updateRequest }, { arrayFilters: [{ 'i._id': mongoose.Types.ObjectId(req.params.level_id) }], upsert: true }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Level updated!',
        field: req.body
      })
    }
  })
})

router.put('/lessons/:level_id/:lesson_id', (req, res, next) => {
  const updateRequest = {}
  for (key in req.body) {
    let keyString = 'levels.$[i].lessons.$[j].' + key
    updateRequest[keyString] = req.body[key]
  }
  Language.update({}, { $set: updateRequest }, { arrayFilters: [{ 'i._id': mongoose.Types.ObjectId(req.params.level_id) }, { 'j._id': mongoose.Types.ObjectId(req.params.lesson_id) }], upsert: true }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Lesson updated!',
        field: req.body
      })
    }
  })
})

router.put('/tasks/:level_id/:lesson_id/:task_id', (req, res, next) => {
  const updateRequest = {}
  for (key in req.body) {
    let keyString = 'levels.$[i].lessons.$[j].tasks.$[g].' + key
    updateRequest[keyString] = req.body[key]
  }
  Language.update({}, { $set: updateRequest }, { arrayFilters: [{ 'i._id': mongoose.Types.ObjectId(req.params.level_id) }, { 'j._id': mongoose.Types.ObjectId(req.params.lesson_id) }, { 'g._id': mongoose.Types.ObjectId(req.params.task_id) }], upsert: true }, (error, succes) => {
    if (error) {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    } else {
      console.log(succes)
      res.status(201).json({
        message: 'Task updated!',
        field: req.body
      })
    }
  })
})

module.exports = router