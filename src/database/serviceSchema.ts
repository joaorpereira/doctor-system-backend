import mongoose, { Schema } from "mongoose";

const ServicesSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: "Companies",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  service_duration: {
    type: Date, // minutes
    required: true,
  },
  service_recurrence: {
    type: Number, // days
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["ATIVO", "INATIVO", "REMOVIDO"],
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

export default ServicesSchema;
