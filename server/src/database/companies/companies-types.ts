import { Document, Model } from 'mongoose'

export type IAddress = {
  country: String
  state: String
  city: String
  cep: String
  number: String
}

export type IGeolocation = {
  type: String
  cordinates: String[]
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
  created_at: Date
  updated_at: Date
}

export interface ICompaniesDocument extends ICompanies, Document {}

export interface ICompaniesModel extends Model<ICompaniesDocument> {}
