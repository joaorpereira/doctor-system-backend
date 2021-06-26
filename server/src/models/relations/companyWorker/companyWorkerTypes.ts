import { Document, Model } from "mongoose";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}

export type ICompanyWorker = {
  company_id: string;
  worker_id: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
  _doc?: Object;
};

export interface ICompanyWorkerDocument extends ICompanyWorker, Document {}

export interface ICompanyWorkerModel extends Model<ICompanyWorkerDocument> {}
