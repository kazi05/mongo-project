const mongoose = require('mongoose')

const languageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  title: { type: String, required: true },
  flag: { type: String, required: true },
  levels: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    is_paid: { type: Boolean, default: false },
    order: { type: Number },
    lessons: [{
      _id: mongoose.Schema.Types.ObjectId,
      name: { type: String, required: true },
      title: { type: String, required: true },
      order: { type: Number },
      tasks: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        title: { type: String, required: true },
        meta: { type: Boolean, default: false},
        order: { type: Number }
      }]
    }]
  }],
  date: { type: Date, default: Date.now }
}, {
  versionKey: false,
  collection: 'Languages'
})

module.exports = mongoose.model('Language', languageSchema)