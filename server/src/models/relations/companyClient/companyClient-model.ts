import { model } from 'mongoose'
import companyClient from '../../../database/relations/companyClient-schema'
import { ICompanyClientDocument } from './companyClient-types'

export const CompanyClientModel = model<ICompanyClientDocument>(
  'CompanyClient',
  companyClient
)
