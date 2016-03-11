import mongoose from 'mongoose'

const AccidentSchema = new mongoose.Schema({
  name: {
    type: String
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
