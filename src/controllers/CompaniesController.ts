import mongoose from "mongoose";
import { Request, Response } from "express";
import { CompaniesModel } from "../models/companies/companiesModel";
import { getDistance } from "../services/distance";
import { pagarmeService } from "../services/pargar-me";
import { ICompanies, Status } from "../models/companies/companiesTypes";
import { hashPassword, comparePassword } from "../services/hashPassword";
import { generateToken, Role } from "../services/generateToken";

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
      const company = await CompaniesModel.findOne({
        email,
      }).select(
        "name email _id password picture background role bank_account geolocation address"
      );

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

      const token: string = generateToken({
        id: company.id,
        role: company.role as Role,
      });

      const user = {
        name: company.name,
        email: company.email,
        _id: company._id,
        picture: company.picture,
        background: company.background,
        role: company.role,
        bank_account: company.bank_account,
        geolocation: company.geolocation,
        address: company.address,
      };

      res.status(200).send({
        token,
        message: "Usuário logado com sucesso",
        user,
      });
    } catch (error: any) {
      res.status(statusCode).send({
        message,
        error: error.message,
      });
    }
  }

  async getCompanyList(req: Request, res: Response) {
    try {
      const companies = await CompaniesModel.find().select(
        " -updated_at -__v -password -bank_account"
      );

      res.status(200).send({
        data: companies,
        message: "Lista de empresas obtida com sucesso",
      });
    } catch (error) {
      res.status(404).send({
        message: "Lista de empresas não encontrada",
        error: error.message,
      });
    }
  }

  async getCompany(req: Request, res: Response) {
    try {
      const { id, lat: user_lat, lon: user_lon } = req.params;

      const company = await CompaniesModel.findById(id).select(
        " -updated_at -__v -password -bank_account"
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

      res.status(200).send({
        data: { company, distance },
        message: "Distância entre cliente e empresa obtida com sucesso",
      });
    } catch (error) {
      res.status(404).send({
        message: "Erro ao obter a distância entre cliente e empresa",
        error: error.message,
      });
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
        data: newCompanies,
        message: "Lista de empresas filtrada obtida com sucesso",
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
    let newCompany = {} as ICompanies;

    try {
      const companyData: ICompanies = req.body;

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

      const data = {
        _id: newCompany._id,
        name: newCompany.name,
        geolocation: newCompany.geolocation,
        status: newCompany.status,
        role: newCompany.role,
        created_at: newCompany.created_at,
        email: newCompany.email,
        picture: newCompany.picture,
        background: newCompany.background,
        phone_number: newCompany.phone_number,
        address: newCompany.address,
        bank_account: newCompany.bank_account,
        recipient_id: newCompany.recipient_id,
      };

      res.status(201).send({
        data,
        message: "Empresa criada com sucesso",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({ message, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        password,
        phone_number,
        address,
        picture,
        background,
        geolocation,
        ...rest
      }: ICompanies = req.body;

      const company = await CompaniesModel.findById(id).select(
        " -updated_at -__v -password -bank_account"
      );

      const hashedPassword = await hashPassword(password);

      const update = {
        ...rest,
        name: name ?? company?.name,
        password: hashedPassword ?? company?.password,
        picture: picture ?? company?.name,
        background: background ?? company?.background,
        phone_number: phone_number ?? company?.phone_number,
        geolocation: geolocation ?? company?.geolocation,
        address: address ?? company?.address,
      };

      const newCompany = await CompaniesModel.findOneAndUpdate(
        { _id: id },
        update,
        {
          returnOriginal: false,
        }
      ).select(" -updated_at -__v");

      res
        .status(200)
        .send({ data: newCompany, message: "Empresa alterada com sucesso" });
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
