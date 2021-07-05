import mongoose from "mongoose";
import { Request, Response } from "express";
import { CompaniesModel } from "../models/companies/companiesModel";
import { getDistance } from "../services/distance";
import { pagarmeService } from "../services/pargar-me";
import { Status } from "../models/companies/companiesTypes";
import { hashPassword, comparePassword } from "../services/hashPassword";

class CompaniesController {
  async login(req: Request, res: Response) {
    let statusCode = 404;
    let message = "Erro ao efetuar login";

    const { email, password } = req.body;

    try {
      if (!email || !password) {
        statusCode = 406;
        message = "Email e senha são campos obrigatórios";
        throw new Error(message);
      }
      const company: any = await CompaniesModel.findOne({
        email,
      });

      if (!company) {
        statusCode = 404;
        message = "Empresa não encontrada ou senha incorreta";
        throw new Error(message);
      }

      const comparedPassword = comparePassword(password, company.password);

      if (!comparedPassword) {
        statusCode = 401;
        message = "Empresa não encontrada ou senha incorreta";
        throw new Error(message);
      }

      res.status(200).send({ company, message: "Usuário logado com sucesso" });
    } catch (error) {
      res.status(statusCode).send({
        message,
        error: error.message,
      });
    }
  }

  async getCompanyList(req: Request, res: Response) {
    try {
      const companies = await CompaniesModel.find().select(" -updated_at -__v");
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

      const company = await CompaniesModel.findById(id).select(
        " -updated_at -__v"
      );
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

  async getFilteredCompanyList(req: Request, res: Response) {
    try {
      const status: Status = Status.ATIVO;
      const companies = await CompaniesModel.find({
        status,
      }).select("_id name");

      const newCompanies = companies.map((s) => ({
        label: s.name,
        value: s._id,
      }));

      res.status(200).send({
        companies: newCompanies,
      });
    } catch (error) {
      res.status(404).send({
        message: "Erro ao filtrar lista de empresas",
        error: error.message,
      });
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

      const { bank_account } = companyData;

      const bankAccountData = {
        agencia: bank_account.bank_agency,
        bank_code: bank_account.bank_code,
        conta: bank_account.acc_number,
        conta_dv: bank_account.verify_digit,
        document_number: bank_account.cpf_or_cnpj,
        legal_name: bank_account.acc_user_name,
        type: bank_account.acc_type,
      };

      const pagarMeBankAccount = await pagarmeService({
        endpoint: "bank_accounts",
        data: bankAccountData,
      });

      if (pagarMeBankAccount.message) {
        // eslint-disable-next-line no-throw-literal
        throw pagarMeBankAccount as string;
      }

      const recipientData = {
        transfer_interval: "daily",
        transfer_enabled: true,
        bank_account_id: pagarMeBankAccount?.data?.id,
      };

      const pagarMeRecipient = await pagarmeService({
        endpoint: "recipients",
        data: recipientData,
      });

      if (pagarMeRecipient.message) {
        message = pagarMeRecipient as string;
        // eslint-disable-next-line no-throw-literal
        throw pagarMeRecipient as string;
      }

      const hashedPassword = await hashPassword(companyData.password);

      newCompany = await new CompaniesModel({
        ...companyData,
        password: hashedPassword,
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

      const hashedPassword = await hashPassword(data.password);

      const update = {
        ...data,
        name: data.name,
        password: hashedPassword,
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
      ).select(" -updated_at -__v");

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
