import mongoose from "mongoose";
import { Request, Response } from "express";
import { pagarmeService } from "../services/pargar-me";
import { ClientsModel } from "../models/clients/clientsModel";
import { IClients, Status } from "../models/clients/clientsTypes";
import { CompanyClientModel } from "../models/relations/companyClient/companyClientModel";
import { hashPassword, comparePassword } from "../services/hashPassword";

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
      const client: any = await ClientsModel.findOne({
        email,
      });

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

      res.status(200).send({ client, message: "Usuário logado com sucesso" });
    } catch (error) {
      res.status(statusCode).send({
        message,
        error: error.message,
      });
    }
  }

  async getAllClients(req: Request, res: Response) {
    try {
      const clients = await ClientsModel.find().select(" -updated_at -__v");
      res.status(200).send({ clients });
    } catch (error) {
      res.status(404).send({
        message: "Lista de clientes não encontrada",
        error: error.message,
      });
    }
  }

  async getClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientsModel.findById(id).select(
        " -updated_at -__v"
      );

      res.status(200).send({ client });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Cliente não encontrado", error: error.message });
    }
  }

  async filteredClientList(req: Request, res: Response) {
    try {
      const { filters } = req.body;
      const clients = await ClientsModel.find(filters).select(
        " -updated_at -__v"
      );

      res
        .status(200)
        .send({ clients, message: "Lista de clientes encontrada" });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Cliente não encontrado", error: error.message });
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

      let newClient = null;

      if (!client) {
        const _id = mongoose.Types.ObjectId();

        const data = {
          external_id: _id,
          name: client_data.name,
          type:
            client_data.document.type === "cpf" ? "individual" : "corporations",
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

      if (client && verifyRelationship) {
        message = "Cliente já cadastrado";
        throw new Error(message);
      } else {
        res.status(201).send({
          client: client ?? newClient,
          message: "Cliente criado com sucesso",
        });
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({ message, error });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const hashedPassword = await hashPassword(data.password);

    try {
      const update = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        picture: data.picture,
        phone_number: data.phone_number,
        address: data.address,
      };

      const client = await ClientsModel.findOneAndUpdate({ _id: id }, update, {
        returnOriginal: false,
      }).select(" -updated_at -__v -customer_id");

      if (!client) {
        throw new Error("Dados do cliente não foram encontrados");
      }

      res.status(200).send({ message: "Cliente alterado com sucesso", client });
    } catch (error) {
      res.status(404).send({
        message: "Erro ao alterar dados do cliente",
        error: error.message,
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
      res
        .status(404)
        .send({ message: "Erro ao remover Cliente", error: error.message });
    }
  }
}

export default new ClientsControllers();
