import { Document, Model } from "mongoose";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}

export enum AccountType {
  conta_corrente = "conta_corrente",
  conta_poupanca = "conta_poupanca",
  conta_poupanca_conjunta = "conta_poupanca_conjunta",
  conta_corrente_conjunta = "conta_corrente_conjunta",
}

export type IBankAccount = {
  acc_user_name: string;
  bank_agency: string;
  acc_type: AccountType;
  bank_code: string;
  verify_digit: string;
  number: string;
  acc_number: string;
};

export type IWorkerData = {
  bank_account: IBankAccount;
  status: Status;
  created_at: Date;
  updated_at: Date;
  _id: string;
  name: string;
  email: string;
  picture: string;
  phone_number: string;
  gender: string;
  birth_date: string;
};

export type IWorkerService = {
  service_id: string;
  worker_id: string;
  status: Status;
  created_at?: Date;
  updated_at?: Date;
};

export type ICompanyWorkers = {
  _id: string;
  status: Status;
  worker: IWorkerData;
  services: IWorkerService;
  created_at: Date;
  updated_at?: Date;
};

export interface IWorkerServiceDocument extends IWorkerService, Document {}

export type IWorkerServiceModel = Model<IWorkerServiceDocument>;
