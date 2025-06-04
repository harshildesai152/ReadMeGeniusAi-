import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPasswordSync(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
}

export function comparePasswordSync(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
}
