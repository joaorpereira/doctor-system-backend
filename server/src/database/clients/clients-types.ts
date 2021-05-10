import { Document, Model } from 'mongoose'

export enum Gender {
  'MASCULINO',
  'FEMININO',
}

export enum Status {
  'ATIVO',
  'INATIVO',
}

export type IAddress = {
  country: String
  state: String
  city: String
  cep: String
  number: String
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
  cpf_or_cnpj: String
  address: IAddress
  created_at: Date
  updated_at: Date
}

export interface IClientsDocument extends IClients, Document {}

export interface IClientsModel extends Model<IClientsDocument> {}
