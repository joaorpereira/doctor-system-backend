import { model } from 'mongoose'
import companyClient from './companyClient-schema'
import { ICompanyClientDocument } from './companyClient-types'

export const WorkerServiceModel = model<ICompanyClientDocument>(
  'CompanyClient',
  companyClient
)
