import { model } from 'mongoose'
import CompaniesSchema from './companies-schema'
import { ICompaniesDocument } from './companies-types'

export const CompaniesModel = model<ICompaniesDocument>(
  'Companies',
  CompaniesSchema
)
