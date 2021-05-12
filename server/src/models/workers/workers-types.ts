import { Document, Model } from 'mongoose'

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
}

export enum Status {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum AccountType {
  CORRENTE = 'CORRENTE',
  SALARIO = 'SALARIO',
  POUPANCA = 'POUPANCA',
}

export type IBankAccount = {
  acc_user_name: String
  acc_type: String
  city: AccountType
  bank_name: String
  verify_digit: String
}

export interface IWorkers {
  name: string
  email: string
  password: string
  picture: string
  phone_number: string
  gender: Gender
  birth_date: String
  status: Status
  cpf_or_cnpj: String
  bank_account: IBankAccount
  recipient_id: String
  created_at: Date
  updated_at: Date
}

export interface IWorkersDocument extends IWorkers, Document {}

export interface IWorkersModel extends Model<IWorkersDocument> {}
