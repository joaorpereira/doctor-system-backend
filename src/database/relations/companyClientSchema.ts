import mongoose, { Schema } from "mongoose";

const companyClient = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: "Companies",
    required: true,
  },
  client_id: {
    type: mongoose.Types.ObjectId,
    ref: "Clients",
    required: true,
  },
  status: {
    type: String,
    enum: ["ATIVO", "INATIVO"],
    required: true,
    default: "ATIVO",
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

export default companyClient;
