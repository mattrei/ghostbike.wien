import mongoose from 'mongoose'
import Accident from './Accident'
import {getSchema} from '@risingstack/graffiti-mongoose';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/graphql');

export default getSchema([Pet, User]);
