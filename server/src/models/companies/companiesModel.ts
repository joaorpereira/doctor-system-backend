import { model } from 'mongoose'
import CompaniesSchema from '../../database/companySchema'
import { ICompaniesDocument } from './companiesTypes'

export const CompaniesModel = model<ICompaniesDocument>(
  'Companies',
  CompaniesSchema
)
