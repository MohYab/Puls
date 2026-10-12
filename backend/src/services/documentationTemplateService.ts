import { prisma } from "../utils/prisma.js";

export async function getAllTemplates() {
  return prisma.documentationTemplate.findMany({
    orderBy: { name: "asc" },
  });
}
