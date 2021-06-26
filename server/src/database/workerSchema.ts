import { Schema } from "mongoose";

const WorkersSchema = new Schema({
  name: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  email: {
    type: String,
    required: [true, "Email é obrigatório"],
  },
  password: {
    type: String,
    required: [true, "Senha é obrigatório"],
  },
  picture: String,
  phone_number: String,
  gender: {
    type: String,
    enum: ["MASCULINO", "FEMININO"],
    required: true,
  },
  birth_date: {
    type: String,
    required: [true, "Data de nascimento é obrigatório"],
  },
  status: {
    type: String,
    enum: ["ATIVO", "INATIVO"],
    required: true,
    default: "ATIVO",
  },
  document: {
    type: {
      type: String,
      enum: ["cpf", "cnpj"],
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: [true, "CPF/CNPJ já cadastrado"],
    },
  },
  bank_account: {
    acc_user_name: {
      type: String,
      required: true,
    },
    acc_number: {
      type: String,
      required: true,
      unique: [true, "Conta bancária já cadastrada"],
    },
    acc_type: {
      type: String,
      enum: [
        "conta_corrente",
        "conta_poupanca",
        "conta_corrente_conjunta",
        "conta_poupanca_conjunta",
      ],
      required: true,
    },
    bank_code: {
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
  recipient_id: {
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
});

export default WorkersSchema;
