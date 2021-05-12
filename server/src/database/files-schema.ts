import mongoose, { Schema } from 'mongoose'

const FilesSchema = new Schema({
  //referencia dinamica
  reference_id: {
    type: mongoose.Types.ObjectId,
    refPath: 'model',
  },
  model: {
    type: String,
    required: true,
    enum: ['Services, Companies'],
  },
  folder: {
    type: String,
    required: true,
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

export default FilesSchema
