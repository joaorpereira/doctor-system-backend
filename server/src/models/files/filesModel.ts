import { model } from "mongoose";
import FilesSchema from "../../database/fileSchema";
import { IFilesDocument } from "./filesTypes";

export const FilesModel = model<IFilesDocument>("Files", FilesSchema);
