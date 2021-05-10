import { model } from 'mongoose'
import ClientsSchema from '../../database/clients-schema'
import { IClientsDocument } from './clients-types'

export const CompanyModel = model<IClientsDocument>('Clients', ClientsSchema)
