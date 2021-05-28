import { Document, Model } from 'mongoose'

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
}

export enum Status {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum DocumentType {
  cpf = 'cpf',
  cnpj = 'cnpj',
}

export interface IDocument {
  cpf_or_cnpj: String
  type: DocumentType
}

export type IAddress = {
  country: String
  state: String
  city: String
  cep: String
  number: String
  street: String
}
export interface IClients {
  name: string
  email: string
  password: string
  picture: string
  phone_number: string
  gender: Gender
  birth_date: String
  status: Status
  document: IDocument
  address: IAddress
  customer_id?: string
  created_at?: Date
  updated_at?: Date
}

export interface IClientsDocument extends IClients, Document {}

export interface IClientsModel extends Model<IClientsDocument> {}
