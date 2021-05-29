import { model } from 'mongoose'
import companyWorker from '../../../database/relations/companyWorkerSchema'
import { ICompanyWorkerDocument } from './companyWorkerTypes'

export const CompanyWorkerModel = model<ICompanyWorkerDocument>(
  'CompanyWorker',
  companyWorker
)
