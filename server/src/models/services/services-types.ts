import { Document, Model } from 'mongoose'

export enum Status {
  'ATIVO',
  'INATIVO',
}

export interface IServices {
  company_id: string
  title: string
  price: Number
  service_duration: Number
  service_recurrence: Number
  description: String
  status: Status
  created_at: Date
  updated_at: Date
}

export interface IServicesDocument extends IServices, Document {}

export interface IServicesModel extends Model<IServicesDocument> {}
