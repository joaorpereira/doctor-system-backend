import mongoose from "mongoose";
import { Request, Response } from "express";
import { pagarmeService } from "../services/pargar-me";
import { ClientsModel } from "../models/clients/clientsModel";
import {
  IClients,
  IClientsDocument,
  Status,
} from "../models/clients/clientsTypes";
import { CompanyClientModel } from "../models/relations/companyClient/companyClientModel";
import { hashPassword, comparePassword } from "../services/hashPassword";
import { generateToken, Role } from "../services/generateToken";

type ErrorProps = {
  message?: string;
  statusCode?: number;
};

class ClientsControllers {
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
      const client = await ClientsModel.findOne({
        email,
      }).select("name email _id picture role phone_number address");

      if (!client) {
        statusCode = 404;
        message = "Usuário não encontrado ou senha incorreta";
        throw new Error(message);
      }

      const comparedPassword = comparePassword(password, client.password);

      if (!comparedPassword) {
        statusCode = 401;
        message = "Usuário não encontrado ou senha incorreta";
        throw new Error(message);
      }

      const token: string = generateToken({
        id: client.id,
        role: client.role as Role,
      });

      res
        .status(200)
        .send({ token, user: client, message: "Usuário logado com sucesso" });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res.status(statusCode).send({
        message,
        error: newError.message,
      });
    }
  }

  async getAllClients(req: Request, res: Response) {
    try {
      const clients = await ClientsModel.find().select(
        " -updated_at -__v -password"
      );
      res.status(200).send({ data: clients });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res.status(404).send({
        message: "Lista de clientes não encontrada",
        error: newError.message,
      });
    }
  }

  async getClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientsModel.findById(id).select(
        " -updated_at -__v -password"
      );

      res.status(200).send({ data: client });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res
        .status(404)
        .send({ message: "Cliente não encontrado", error: newError.message });
    }
  }

  async filteredClientList(req: Request, res: Response) {
    try {
      const { filters } = req.body;
      const clients = await ClientsModel.find(filters).select(
        " -updated_at -__v -password"
      );

      res
        .status(200)
        .send({ data: clients, message: "Lista de clientes encontrada" });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res
        .status(404)
        .send({ message: "Cliente não encontrado", error: newError.message });
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();
    let message = "Erro ao criar cliente";

    try {
      const {
        company_id,
        client_data,
      }: { company_id: string; client_data: IClients } = req.body;

      const client = await ClientsModel.findOne({
        $or: [
          { email: client_data.email },
          { phone_number: client_data.phone_number },
        ],
      });

      let newClient = {} as IClientsDocument;

      if (!client) {
        const _id = mongoose.Types.ObjectId();

        const data = {
          external_id: _id,
          name: client_data.name,
          type:
            client_data.document.type === "cpf" ? "individual" : "corporation",
          country: client_data.address.country,
          email: client_data.email,
          documents: [
            {
              type: client_data.document.type,
              number: client_data.document.number,
            },
          ],
          phone_numbers: [client_data.phone_number],
          birthday: client_data.birth_date,
        };

        const pagarMeCustomer = await pagarmeService({
          endpoint: "customers",
          data,
        });

        if (pagarMeCustomer.message) {
          // eslint-disable-next-line no-throw-literal
          throw pagarMeCustomer as string;
        }

        const hashedPassword = await hashPassword(client_data.password);

        // create client
        newClient = await new ClientsModel({
          ...client_data,
          _id,
          password: hashedPassword,
          customer_id: pagarMeCustomer?.data?.id as string,
        }).save({ session });
      }

      const client_id: string = client
        ? client._id
        : (newClient?._id as string);

      const verifyRelationship = await CompanyClientModel.findOne({
        company_id,
        client_id,
        status: {
          $ne: Status.INATIVO,
        },
      });

      if (!verifyRelationship) {
        await new CompanyClientModel({
          company_id,
          client_id,
        }).save({ session });
      }

      if (verifyRelationship) {
        await CompanyClientModel.findOneAndUpdate(
          {
            company_id,
            client_id,
          },
          { status: Status.ATIVO },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      const role = (client
        ? client.role
        : newClient && newClient.role) as unknown as Role;

      const token: string = generateToken({
        id: client?.id ?? newClient?.id,
        role,
      });

      if (client && verifyRelationship) {
        message = "Cliente já cadastrado";
        throw new Error(message);
      }

      const clientData = {
        status: client?.status ?? newClient?.status,
        role: client?.role ?? newClient?.role,
        _id: client?._id ?? newClient?._id,
        name: client?.name ?? newClient?.name,
        email: client?.email ?? newClient?.email,
        picture: client?.picture ?? newClient?.picture,
        phone_number: client?.phone_number ?? newClient?.phone_number,
        gender: client?.gender ?? newClient?.gender,
        birth_date: client?.birth_date ?? newClient?.birth_date,
        document: client?.document ?? newClient?.document,
        address: client?.address ?? newClient?.address,
        customer_id: client?.customer_id ?? newClient?.customer_id,
      };

      res.status(201).send({
        token,
        data: clientData,
        message: "Cliente criado com sucesso",
      });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({ message, error: newError.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: IClientsDocument = req.body;

    const client = await ClientsModel.findById(id).select(
      " -updated_at -__v -password -bank_account"
    );

    const { name, email, password, picture, phone_number, address } = data;

    let hashedPassword = password;

    if (password) {
      hashedPassword = await hashPassword(password);
    }

    try {
      const update = {
        name: name ?? client?.name,
        email: email ?? client?.email,
        password: hashedPassword ?? client?.password,
        picture: picture ?? client?.picture,
        phone_number: phone_number ?? client?.phone_number,
        address: address ?? client?.address,
      };

      const newClient = await ClientsModel.findOneAndUpdate(
        { _id: id },
        update,
        {
          returnOriginal: false,
        }
      ).select(" -updated_at -__v -customer_id -password");

      if (!newClient) {
        throw new Error("Dados do cliente não foram encontrados");
      }

      res
        .status(200)
        .send({ data: newClient, message: "Cliente alterado com sucesso" });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res.status(404).send({
        message: "Erro ao alterar dados do cliente",
        error: newError.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ClientsModel.deleteOne({ _id: id });
      await CompanyClientModel.deleteOne({ client_id: id });
      res.status(200).send({ message: "Cliente removido com sucesso" });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res.status(404).send({
        message: "Erro ao remover Cliente",
        error: newError.message,
      });
    }
  }
}

export default new ClientsControllers();
