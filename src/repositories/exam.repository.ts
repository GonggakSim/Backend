import { prisma } from "../db.config.js";

// 시험 추가
export const addExam = async (data: any) => {
  const createdExam = await prisma.exam.create({
    data: {
      id: data.id,
      title: data.title,
      examDate: data.examDate,
      examRange: data.examRange,
      memo: data.memo,
      status: data.status,
      userId: data.userId,
    },
  });

  return createdExam.id;
};

// 시험 조회
export const getExam = async (examId: number) => {
  const exam = await prisma.exam.findFirst({ where: { id: examId } });
  return exam;
};