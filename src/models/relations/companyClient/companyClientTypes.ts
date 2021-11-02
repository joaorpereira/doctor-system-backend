import { Document, Model } from "mongoose";
import { IClients } from "../../clients/clientsTypes";
import { ICompanies } from "../../companies/companiesTypes";

export enum Status {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  REMOVIDO = "REMOVIDO",
}

export type ICompanyClient = {
  client_id: string;
  company_id: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export type ICompanyClientProps = {
  client_id: { _doc: IClients };
  company_id: ICompanies;
};

export interface ICompanyClientDocument extends ICompanyClient, Document {}

export type ICompanyClientModel = Model<ICompanyClientDocument>;
