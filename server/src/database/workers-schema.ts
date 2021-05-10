import { Schema } from 'mongoose'

const WorkersSchema = new Schema({
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
  cpf_or_cnpj: {
    type: String,
    required: true,
    unique: [true, 'CPF/CNPJ já cadastrado'],
  },
  bank_account: {
    acc_user_name: {
      type: String,
      required: true,
    },
    acc_number: {
      type: String,
      required: true,
      unique: [true, 'Conta bancária já cadastrada'],
    },
    acc_type: {
      type: String,
      enum: ['CORRENTE, SALARIO, POUPANCA'],
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
    bank_agency: {
      type: String,
      required: true,
    },
    verify_digit: {
      type: String,
      required: true,
    },
  },
  recipient_id : {
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

export default WorkersSchema
