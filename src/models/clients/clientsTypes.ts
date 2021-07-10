import { Document, Model } from "mongoose";
import { Role } from "../../services/generateToken";

export enum Gender {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export type IDocument = {
  number: string;
  type: "cpf" | "cnpj";
};

export type IAddress = {
  country: string;
  state: string;
  city: string;
  cep: string;
  number: string;
  street: string;
};

export type IClients = {
  name: string;
  email: string;
  password: string;
  picture: string;
  phone_number: string;
  gender: Gender;
  birth_date: string;
  status: Status;
  document: IDocument;
  address: IAddress;
  role: Role;
  customer_id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export interface IClientsDocument extends IClients, Document {}

export type IClientsModel = Model<IClientsDocument>;
