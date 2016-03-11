import mongoose from 'mongoose'
import Accident from './accident'
import {getSchema} from '@risingstack/graffiti-mongoose'

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/ghostbike')

export default getSchema([Accident])