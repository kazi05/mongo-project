const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  state: {
    stateLang: [{
      lang_id: mongoose.Schema.Types.ObjectId,
      ready_percent: { type: Number, default: 0 }
    }],
    stateLevel: [{
      level_id: mongoose.Schema.Types.ObjectId,
      is_passed: { type: Boolean, default: false }
    }],
    stateLesson: [{
      lesson_id: mongoose.Schema.Types.ObjectId,
      is_passed: { type: Boolean, default: false }
    }],
    stateTask: [{
      task_id: mongoose.Schema.Types.ObjectId,
      is_passed: {type: Boolean, default: false }
    }]
  },
  date: { type: Date, default: Date.now}
}, {
  versionKey: false,
  collection: 'Users'
})

module.exports = mongoose.model('User', userSchema)