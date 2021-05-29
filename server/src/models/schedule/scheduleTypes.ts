import { Document, Model } from 'mongoose'

export interface ISchedule {
  company_id: string
  client_id: string
  worker_id: string
  service_id: string
  schedule_date: Date
  price: Number
  transaction_id: String
  created_at: Date
  updated_at: Date
}

export interface IScheduleDocument extends ISchedule, Document {}

export interface IScheduleModel extends Model<IScheduleDocument> {}
