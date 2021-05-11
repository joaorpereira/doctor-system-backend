import { Schema } from 'mongoose'

const CompaniesSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatório'],
  },
  picture: String,
  background: String,
  phone_number: String,
  address: {
    country: String,
    state: String,
    city: String,
    cep: String,
    number: String,
  },
  geolocation: {
    type: {
      type: String,
    },
    coordinates: {
      type: [Number],
    },
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

CompaniesSchema.index({ geolocation: '2dsphere' })

export default CompaniesSchema
