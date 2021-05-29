import { Document, Model } from 'mongoose'

export type IAddress = {
  country: String
  state: String
  city: String
  cep: String
  number: String
  street: String
}

export type IGeolocation = {
  type: String
  coordinates: number[]
}

export enum Status {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  REMOVIDO = 'REMOVIDO',
}

export enum AccountType {
  conta_corrente = 'conta_corrente',
  conta_poupanca = 'conta_poupanca',
  conta_poupanca_conjunta = 'conta_poupanca_conjunta',
  conta_corrente_conjunta = 'conta_corrente_conjunta',
}

export type IBankAccount = {
  acc_user_name: String
  bank_agency: String
  acc_type: AccountType
  bank_code: String
  verify_digit: String
  cpf_or_cnpj: String
  acc_number: String
}
export interface ICompanies {
  name: string
  email: string
  password: string
  picture: string
  background: string
  phone_number: string
  address: IAddress
  geolocation: IGeolocation
  bank_account: IBankAccount
  status: Status
  recipient_id?: String
  created_at: Date
  updated_at: Date
}

export interface ICompaniesDocument extends ICompanies, Document {
  geolocation: IGeolocation
}

export interface ICompaniesModel extends Model<ICompaniesDocument> {}
