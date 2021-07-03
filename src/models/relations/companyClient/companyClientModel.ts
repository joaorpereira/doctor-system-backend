import { model } from "mongoose";
import companyClient from "../../../database/relations/companyClientSchema";
import { ICompanyClientDocument } from "./companyClientTypes";

export const CompanyClientModel = model<ICompanyClientDocument>(
  "CompanyClient",
  companyClient
);
