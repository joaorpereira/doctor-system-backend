import mongoose, { Schema } from 'mongoose'

const workerService = new Schema({
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
  status: {
    type: String,
    enum: ['ATIVO', 'INATIVO'],
    required: true,
    default: 'ATIVO',
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

export default workerService
