import { Document, Model } from 'mongoose'

export enum Status {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}
export interface ICompanyWorker {
  company_id: string
  worker_id: string
  status: Status
  created_at: Date
  updated_at: Date
}

export interface ICompanyWorkerDocument extends ICompanyWorker, Document {}

export interface ICompanyWorkerModel extends Model<ICompanyWorkerDocument> {}
