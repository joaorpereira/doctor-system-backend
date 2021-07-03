import { Document, Model } from "mongoose";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}
export type IServices = {
  company_id: string;
  title: string;
  price: number;
  service_duration: Date;
  service_recurrence: number;
  description: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export interface IServicesDocument extends IServices, Document {
  _doc: IServices;
}

export type IServicesModel = Model<IServicesDocument>;
