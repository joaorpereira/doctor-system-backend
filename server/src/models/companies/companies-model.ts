import { model } from 'mongoose'
import CompaniesSchema from '../../database/companies-schema'
import { ICompaniesDocument } from './companies-types'

export const CompaniesModel = model<ICompaniesDocument>(
  'Companies',
  CompaniesSchema
)
