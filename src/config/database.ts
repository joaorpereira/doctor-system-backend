/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import mongoose from "mongoose";

let database: mongoose.Connection;

export const connect = () => {
  if (database) return;

  mongoose.connect(`${process.env.DATABASE_URL}`, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  database = mongoose.connection;

  database.once("open", async () => {
    console.log("Connected to database");
  });

  database.on("error", () => {
    console.log("Error connecting to database");
  });
};

export const disconnect = () => {
  if (!database) return;

  mongoose.disconnect();
};
