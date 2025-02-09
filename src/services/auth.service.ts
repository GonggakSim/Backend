import { prisma } from '../db.config.js';
import { Request, Response } from 'express';
import { refreshKakaoToken, refreshNaverToken } from '../utils/auth.utils.js';

// // 토큰 갱신
// export const refreshAccessToken = async (accessEmail: string) => {
//     const user = await prisma.user.findUnique({
//         where: { email: accessEmail }
//     });

//     if (!user || !user.oauthRefreshToken) {
//         throw new Error("리프레시 토큰이 없습니다.");
//     }

//     let newOAuthAccessToken;
//     switch (user.oauthProvider) {
//         case 'kakao':
//             newOAuthAccessToken = await refreshKakaoToken(user.oauthRefreshToken);
//             break;
//         case 'naver':
//             newOAuthAccessToken = await refreshNaverToken(user.oauthRefreshToken);
//             break;
//         default:
//             throw new Error("지원하지 않는 OAuth 제공자입니다.");
//     }
//     return newOAuthAccessToken;
// }

// 세션 삭제
export const clearSession = async (req: Request, res: Response, successMessage: string, snsLogoutUrl?: string) => {
    return new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(new Error("세션 로그아웃 실패"));
        req.session.destroy((destroyErr) => {
          if (destroyErr) 
            return reject(new Error("세션 삭제 실패"));
          res.clearCookie("connect.sid");
          res.json({ message: successMessage, snsLogoutUrl });
          resolve();
        });
      });
    });
  };

// 로그아웃
export const logoutFromSNS = async (provider: string): Promise<string> => {
    if (!provider) throw new Error("OAuth 제공자가 필요합니다.");
  
    // 로그아웃 url
    let logoutUrl = "";
    if (provider === "kakao") {
      logoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.PASSPORT_KAKAO_CLIENT_ID}&logout_redirect_uri=/oauth2/login`;
    } else if (provider === "google") {
      logoutUrl = `http://${process.env.EC2_IP}:${process.env.PORT}/oauth2/login")}`;
    } else if (provider === "naver") {
      logoutUrl = "https://nid.naver.com/nidlogin.logout"; // 클라이언트측에서 리디렉션 처리
    }
  
    return logoutUrl;
};

// 회원탈퇴
export const deleteAccount = async (accessEmail: string, accessToken: string, provider: string): Promise<any> => {
    if (!accessEmail) throw new Error("User not authenticated.");

    const user = await prisma.user.findUnique({where: { email: accessEmail }});
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");

    // 1. SNS 연결 해제
    if (provider === "kakao") {
      await fetch("https://kapi.kakao.com/v1/user/unlink", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else if (provider === "google") {
      await fetch(`http://${process.env.EC2_IP}:${process.env.PORT}/oauth2/login`, { 
        method: "POST" });
    } else if (provider === "naver") {
      await fetch("https://nid.naver.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded",},
        body: `grant_type=delete&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&access_token=${accessToken}`
      });
    }
    // 2. 사용자 데이터 삭제
    await prisma.user.delete({ where: { id: user.id } });
  };