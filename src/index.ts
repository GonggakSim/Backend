import cors from "cors";


import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';

import kakaoRoutes from "./routes/kakaoRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import naverRoutes from "./routes/naverRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import quizRoutes from "./routes/quizRoutes.js"; 
import certificationAlramRoutes from "./routes/certificationAlramRoutes.js";

import { verifyJWT } from "./middlewares/auth.middleware.js";
import { prisma } from "./db.config.js";

//swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// controllers
import {
  handleAddExam,
  handleGetExam,
  handleDeleteExam,
} from "./controllers/exam.controller.js";
import { handleRecommendSchedule } from "./controllers/schedule.controller.js";
import { handleGetCertifications } from "./controllers/certification.controller.js";
import { handleDnDNotification } from "./controllers/notification.controller.js";

import {
  handleGetAllCertifications,
  handleGetCertificationsByCategory,
  handleGetCertificationById,
} from "./controllers/certificateInquiry.controller.js";

// 환경 변수 로드
dotenv.config();

const app = express();
const ec2ip = process.env.EC2_IP;
const port = process.env.PORT;

// 공통 응답 메서드 확장 미들웨어
app.use((req, res, next) => {
  res.create = (create) => {
    return res.json({
      resultType: "CREATE",
      error: null,
      create,
    });
  };

  res.success = (success) => {
    return res.json({
      resultType: "SUCCESS",
      error: null,
      success,
    });
  };

  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };

  next();
});

// swagger 설정
const swaggerSpec = YAML.load(path.join("./src/swagger/openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Express 기본 설정
// cors 방식 허용
// Case1 'Access-Control-Allow-Origin' header..' 특정 프론트엔드 주소 허용 시 : {origin: ["<프론트엔드_주소_및_포트>"],} 처럼 설정해준다.
// Case2 'Request header field x-auth-token..' 프론트 엔드에서 보내는 header 정보 확인 : {allowedHeaders: ["x-auth-token", ...],}
app.use(cors({ origin: ["http://${ec2ip}:3000"], allowedHeaders: ["Authorization"]}));

app.use(express.static("public")); // 정적 파일 접근
app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// 쿠키 파서 설정
app.use(cookieParser());

// 세션 설정
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // 2분마다 만료된 세션
      dbRecordIdIsSessionId: true, // 세션 ID를 데이터베이스 레코드 ID로 사용
      dbRecordIdFunction: undefined,
    }),
  })
);
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI 환경변수가 설정되어 있지 않습니다.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB 연결 성공");
  })
  .catch((err) => {
    console.error("MongoDB 연결 오류:", err);
  });

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
}); // 기본 라우트

app.use("/oauth2", googleRoutes); // 구글 인증 라우트
app.use("/oauth2", kakaoRoutes); // 카카오 인증 라우트
app.use("/oauth2", naverRoutes); // 네이버 인증 라우트
app.use("/oauth2", authRoutes); // 로그아웃, 토큰 갱신, 토큰 검증, 이용약관 동의 라우트
app.use("/api/v1/users", userRoutes); // 사용자 정보 수집 API, 유사 사용자 추천 API, 회원정보 수정 API, 도움말 확인
app.use("/api/v1", examRoutes); // 자격증 시험 일정 추가 라우트
app.use("/api/v1", certificationAlramRoutes); // 시험 일정 알람 생성 라우트

// 캘린더 API
app.post("/api/v1/calander/exams", verifyJWT, handleAddExam);
app.get("/api/v1/calander/exams", verifyJWT, handleGetExam);
app.delete("/api/v1/calander/exams/:examId", verifyJWT, handleDeleteExam); //삭제하려는 시험 id

// 알림 방해금지 시간대 설정 API
app.post("/api/v1/notification/settings", verifyJWT, handleDnDNotification);

// AI 시험 추천 API
app.post("/api/v1/schedule/recommendation", verifyJWT, handleRecommendSchedule);

// 자격증 검색 API
app.get("/api/v1/certifications/search", verifyJWT, handleGetCertifications);

//자격증 목록 조회 API
app.get("/api/v1/certifications", verifyJWT, handleGetAllCertifications);
app.get(
  "/api/v1/certifications/category/:category",
  verifyJWT,
  handleGetCertificationsByCategory
);
app.get("/api/v1/certifications/:id", verifyJWT, handleGetCertificationById);

//퀴즈 API
app.use("/api/v1/quiz", verifyJWT, quizRoutes);


// 전역 오류 처리 미들웨어
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

app.use("/api/v1", scheduleRoutes);

// 서버 실행
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
