import { Document, Model } from 'mongoose'

export enum Status {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  REMOVIDO = 'REMOVIDO',
}
export interface IWorkerService {
  service_id: string
  worker_id: string
  status: Status
  created_at: Date
  updated_at: Date
}

export interface IWorkerServiceDocument extends IWorkerService, Document {}

export interface IWorkerServiceModel extends Model<IWorkerServiceDocument> {}
