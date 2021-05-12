import { model } from 'mongoose'
import FilesSchema from '../../database/files-schema'
import { IFilesDocument } from './files-types'

export const FilesModel = model<IFilesDocument>('Files', FilesSchema)
