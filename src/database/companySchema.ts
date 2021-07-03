import { Schema } from "mongoose";

const CompaniesSchema = new Schema({
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
  background: String,
  phone_number: String,
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
  geolocation: {
    type: {
      type: String,
    },
    coordinates: {
      type: [Number],
    },
  },
  status: {
    type: String,
    enum: ["ATIVO", "INATIVO"],
    required: true,
    default: "ATIVO",
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
    cpf_or_cnpj: {
      type: String,
      required: true,
      unique: [true, "CPF/CNPJ já cadastrado"],
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

CompaniesSchema.index({ geolocation: "2dsphere" });

export default CompaniesSchema;
