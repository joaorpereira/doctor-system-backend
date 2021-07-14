import { Document, Model } from "mongoose";
import { Role } from "../../services/generateToken";

export type IAddress = {
  country: string;
  state: string;
  city: string;
  cep: string;
  number: string;
  street: string;
};

export type IGeolocation = {
  type: string;
  coordinates: number[];
};

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
  cpf_or_cnpj: string;
  acc_number: string;
};

export type ICompanies = {
  name: string;
  email: string;
  password: string;
  picture: string;
  background: string;
  phone_number: string;
  address: IAddress;
  geolocation: IGeolocation;
  bank_account: IBankAccount;
  status?: Status;
  role?: Role;
  recipient_id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export interface ICompaniesDocument extends ICompanies, Document {
  geolocation: IGeolocation;
}

export type ICompaniesModel = Model<ICompaniesDocument>;
