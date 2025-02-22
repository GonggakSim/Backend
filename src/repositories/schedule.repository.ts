import { prisma } from "../db.config.js";

export const findSchedulesByExamName = async (name: string) => {
  return await prisma.schedule.findMany({
    where: { certification: { name: { equals: name } } },
    include: { certification: true },
  });
};
