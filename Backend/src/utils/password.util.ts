import bcrypt from "bcrypt";

const DEFAULT_SALT_ROUNDS = 12;

const getSaltRounds = (): number => {
  const rawSaltRounds = process.env.BCRYPT_SALT_ROUNDS;
  const parsed = Number(rawSaltRounds);

  if (Number.isNaN(parsed) || parsed < 8 || parsed > 15) {
    return DEFAULT_SALT_ROUNDS;
  }

  return parsed;
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, getSaltRounds());
};

export const verifyPassword = (
  plainPassword: string,
  passwordHash: string
): Promise<boolean> => bcrypt.compare(plainPassword, passwordHash);
