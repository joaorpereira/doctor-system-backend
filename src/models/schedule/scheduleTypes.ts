import { Document, Model } from "mongoose";

export type ISchedule = {
  company_id: string;
  client_id: string;
  worker_id: string;
  service_id: string;
  schedule_date: Date;
  price: number;
  transaction_id: string;
  created_at: Date;
  updated_at: Date;
};

export interface IScheduleDocument extends ISchedule, Document {}

export type IScheduleModel = Model<IScheduleDocument>;
