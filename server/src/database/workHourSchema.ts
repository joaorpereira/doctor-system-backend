import mongoose, { Schema } from "mongoose";

const WorkHoursSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: "Companies",
    required: true,
  },
  services: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Services",
      required: true,
    },
  ],
  workers: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Workers",
      required: true,
    },
  ],
  days: {
    type: [Number],
    required: true,
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
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

export default WorkHoursSchema;
