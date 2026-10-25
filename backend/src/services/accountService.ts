import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../utils/errors.js";
import type { RequestingUser } from "../types/requestingUser.js";
import type { AccountInput, PasswordChangeInput } from "../validators/accountValidators.js";

const BCRYPT_ROUNDS = 10;

// Never includes passwordHash.
const accountSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  doctor: { select: { specialization: true } },
} as const;

type AccountRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "DOCTOR" | "ADMIN";
  doctor: { specialization: string | null } | null;
};

function toAccount({ doctor, ...user }: AccountRow) {
  return { ...user, specialization: doctor?.specialization ?? null };
}

export async function getAccount(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: accountSelect });
  if (!user) {
    throw new NotFoundError("Account not found");
  }
  return toAccount(user);
}

export async function updateAccount(requestingUser: RequestingUser, input: AccountInput) {
  const user = await prisma.user.update({
    where: { id: requestingUser.userId },
    data: {
      name: input.name,
      phone: input.phone || null,
      // Email is not editable here: it is the login identity and is changed by an admin.
      ...(requestingUser.role === "DOCTOR" && {
        doctor: { update: { specialization: input.specialization || null } },
      }),
    },
    select: accountSelect,
  });
  return toAccount(user);
}

export async function changePassword(userId: string, input: PasswordChangeInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    throw new NotFoundError("Account not found");
  }

  // 400, not 401: the user is logged in, and the frontend treats every 401 as
  // an expired session and logs out.
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw new AppError(400, "INVALID_CURRENT_PASSWORD", "Current password is incorrect");
  }
  if (input.currentPassword === input.newPassword) {
    throw new ValidationError("The new password must be different from the current one");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS) },
  });
}
