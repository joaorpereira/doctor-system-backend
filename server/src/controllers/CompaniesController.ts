import mongoose from "mongoose";
import { Request, Response } from "express";
import { CompaniesModel } from "../models/companies/companiesModel";
import { getDistance } from "../services/distance";
import { pagarmeService } from "../services/pargar-me";

class CompaniesController {
  async getCompanyList(req: Request, res: Response) {
    try {
      const companies = await CompaniesModel.find();
      res.status(200).send({ companies });
    } catch (error) {
      res.status(404).send({
        message: "Lista de clientes não encontrada",
        error: error.message,
      });
    }
  }

  async getCompany(req: Request, res: Response) {
    try {
      const { id, lat: user_lat, lon: user_lon } = req.params;

      let company = await CompaniesModel.findById(id);
      let distance = 0;
      
      if (company) {
        const company_coord: number[] = Object.values(
          company.geolocation.coordinates
        );
        distance = getDistance(
          Number(user_lat),
          Number(user_lon),
          company_coord[0],
          company_coord[1]
        );
      }

      distance = parseFloat(distance.toFixed(1));

      res.status(200).send({ company, distance });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Empresa não localizada", error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    let message = "Erro ao criar empresa";
    let newCompany = null;

    try {
      const companyData = req.body;

      const company = await CompaniesModel.findOne({
        $or: [{ email: companyData.email }],
      });

      if (company) {
        message = "Empresa já cadastrada";
        throw new Error(message);
      }

      const bank_account = companyData.bank_account;

      const pagarMeBankAccount = await pagarmeService("bank_accounts", {
        agencia: bank_account.bank_agency,
        bank_code: bank_account.bank_code,
        conta: bank_account.acc_number,
        conta_dv: bank_account.verify_digit,
        // document_number: bank_account.cpf_or_cnpj,
        legal_name: bank_account.acc_user_name,
        type: bank_account.acc_type,
      });

      if (pagarMeBankAccount.message) {
        throw pagarMeBankAccount as string;
      }

      const pagarMeRecipient = await pagarmeService("recipients", {
        transfer_interval: "daily",
        transfer_enabled: true,
        bank_account_id: pagarMeBankAccount?.data?.id,
      });

      if (pagarMeRecipient.message) {
        message = pagarMeRecipient as string;
        throw pagarMeRecipient as string;
      }

      newCompany = await new CompaniesModel({
        ...companyData,
        recipient_id: pagarMeRecipient?.data?.id as string,
      }).save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).send({
        company: newCompany,
        message: "Empresa criada com sucesso",
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({ message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const update = {
        ...data,
        name: data.name,
        password: data.password,
        picture: data.picture,
        background: data.background,
        phone_number: data.phone_number,
        geolocation: data.geolocation,
        address: data.address,
      };

      const company = await CompaniesModel.findOneAndUpdate(
        { _id: id },
        update,
        {
          returnOriginal: false,
        }
      );

      res
        .status(200)
        .send({ company, message: "Empresa alterada com sucesso" });
    } catch (error) {
      res.status(404).send({
        message: "Erro ao alterar dados da empresa",
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CompaniesModel.deleteOne({ _id: id });
      res.status(200).send({ message: "Empresa removida com sucesso" });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao remover empresa", error: error.message });
    }
  }
}

export default new CompaniesController();
