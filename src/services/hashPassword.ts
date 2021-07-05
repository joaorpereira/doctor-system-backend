import * as bcrypt from "bcryptjs";

export const hashPassword = async (text: string): Promise<string> => {
  const round = Number(process.env.BCRPYT_COST);
  const salt = await bcrypt.genSalt(round);
  return bcrypt.hash(text, salt);
};

export const comparePassword = (
  text: string,
  cryptText: string
): Promise<boolean> => {
  return bcrypt.compare(text, cryptText);
};
