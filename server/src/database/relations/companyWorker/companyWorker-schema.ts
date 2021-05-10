import mongoose, { Schema } from 'mongoose'

const companyWorker = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Companies',
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

export default companyWorker
