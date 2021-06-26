import { Document, Model } from "mongoose";

export enum Gender {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

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

export enum DocumentType {
  cpf = "cpf",
  cnpj = "cnpj",
}
export type IDocument = {
  number: String;
  type: DocumentType;
};

export type IBankAccount = {
  acc_user_name: String;
  bank_agency: String;
  acc_type: AccountType;
  bank_code: String;
  verify_digit: String;
  acc_number: String;
};

export type IWorkers = {
  services?: string[];
  name: string;
  email: string;
  password: string;
  picture?: string;
  phone_number: string;
  gender: Gender;
  birth_date: String;
  status: Status;
  document: IDocument;
  bank_account: IBankAccount;
  recipient_id?: String;
  created_at?: Date;
  updated_at?: Date;
};

export interface IWorkersDocument extends IWorkers, Document {}

export interface IWorkersModel extends Model<IWorkersDocument> {}
