import { Schema } from 'mongoose'

const ClientsSchema = new Schema({
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
  phone_number: String,
  gender: {
    type: String,
    enum: ['MASCULINO', 'FEMININO'],
    required: true,
  },
  birth_date: {
    type: String,
    required: [true, 'Data de nascimento é obrigatório'],
  },
  status: {
    type: String,
    enum: ['ATIVO', 'INATIVO'],
    required: true,
    default: 'ATIVO',
  },
  document: {
    type: {
      type: String,
      enum: ['cpf', 'cnpj'],
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: [true, 'CPF/CNPJ já cadastrado'],
    },
  },
  address: {
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    cep: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
  },
  customer_id:  String,
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },

})

export default ClientsSchema
