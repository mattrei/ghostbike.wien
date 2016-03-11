import mongoose from 'mongoose'
import shortid from 'shortid'

const AccidentSchema = new mongoose.Schema({
  shortid: {
    type: String,
    default: shortid.generate()
  },
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    index: true
  },
  longitude: {
    type: Number,
    index: true
  },
  timesVisited: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now()
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Accident = mongoose.model('Accident', AccidentSchema)

export default Accident
