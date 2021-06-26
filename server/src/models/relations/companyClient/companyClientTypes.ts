import { Document, Model } from "mongoose";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}

export type ICompanyClient = {
  client_id: string;
  worker_id: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export interface ICompanyClientDocument extends ICompanyClient, Document {}

export interface ICompanyClientModel extends Model<ICompanyClientDocument> {}
