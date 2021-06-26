import { Document, Model } from "mongoose";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}
export type IServices = {
  company_id: string;
  title: string;
  price: Number;
  service_duration: Date;
  service_recurrence: Number;
  description: String;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export interface IServicesDocument extends IServices, Document {
  _doc: IServices;
}

export interface IServicesModel extends Model<IServicesDocument> {}
