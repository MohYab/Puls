import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "8h";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctor: true },
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Wrong email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Wrong email or password");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, doctorId: user.doctor?.id ?? null },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctor?.id ?? null,
    },
  };
}
