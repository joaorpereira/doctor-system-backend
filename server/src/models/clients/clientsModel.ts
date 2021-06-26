import { model } from "mongoose";
import ClientsSchema from "../../database/clientSchema";
import { IClientsDocument } from "./clientsTypes";

export const ClientsModel = model<IClientsDocument>("Clients", ClientsSchema);
