# 🔔 공각심 
<img with="800" src="https://github.com/user-attachments/assets/81bbb2fa-eafd-4689-b84e-42a9b819c13a">

<br/>
<br/>

## Member
#### 😃임수빈
  - 서버 배포
  - 로그인/회원가입 기능
  - 유사 사용자 시험 추천 기능
  
#### 🥰김유진
  - AI 시험 일정 추천 기능
  - 자격증 검색 기능
  - 랜덤 퀴즈 알림 기능
  - 캘린더 (추가, 조회, 삭제) 기능

#### 🤓원준영
  - 자격증 정보 크롤링
  - 자격증 (전체 목록, 상세 정보, 시험 일정) 조회 기능
  - 랜덤 퀴즈 유형에 따른 퀴즈 출력 기능

#### 😄박세웅
  - 퀴즈 정보 크롤링
  - 자격증 관련 접수/알림/시험일정 등록 기능
  - 랜덤 퀴즈 유형에 따른 정답 유무 기능

<br/>

## Tech stack
- **Framework**: Express
- **Language**: Node.js, TypeScript(서버, API) | Python(크롤링)
- **ORM**: Prisma
- **Database**: MySQL, MongoDB
- **Authentication**: JWTToken, bcrytjs
- **API Documentation**: Swagger
- **Dev Tools**: Nodemon, ESBuild, TSX
- **Realtime Processing**: Firebase Cloud Messaging(FCM), OpenAI API
- **Data Collection** : Python, Open API
- **Cloud Computing**: AWS VPC(VPC peering), AWS EC2  

<br/>

## Git Flow
- main : 최종적으로 배포되는 브랜치
- dev : 배포 전, 개발 중심으로 검증 위주의 브랜치
- feature : 추가 기능을 개발 혹은 기존 기능 수정 브랜치
- hotfix : main 브랜치에서 발생한 버그를 수정하는 브랜치

<br/>

## 🚨 github 주의사항
- Pull request 생성 시, main인지 dev인지 반드시 확인
- 기능 별로 branch 생성
- commit 시, main 업데이트 확인(pull) 후에 push하기
