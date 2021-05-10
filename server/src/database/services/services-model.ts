import { model } from 'mongoose'
import ServicesSchema from './services-schema'
import { IServicesDocument } from './services-types'

export const CompanyModel = model<IServicesDocument>('Services', ServicesSchema)
