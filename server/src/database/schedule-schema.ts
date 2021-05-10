import mongoose, { Schema } from 'mongoose'

const schedule = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Companies',
    required: true,
  },
  service_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Services',
    required: true,
  },
  worker_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Workers',
    required: true,
  },
  schedule_date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  price: {
    type: Number,
    required: true,
  },
  transaction_id: {
    type: String,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
})

export default schedule
