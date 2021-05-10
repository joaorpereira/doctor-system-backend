import { model } from 'mongoose'
import companyWorker from './companyWorker-schema'
import { ICompanyWorkerDocument } from './companyWorker-types'

export const CompanyWorkerModel = model<ICompanyWorkerDocument>(
  'CompanyWorker',
  companyWorker
)
