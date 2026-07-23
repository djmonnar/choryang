# choryang

경남 사천시 곤명면 초량길 27-3에 있는 **다슬기초량마을**의 체험·숙박 예약 홈페이지와 관리자 예약관리 시스템입니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4
- Firebase Admin SDK + Firestore
- 네이버 로그인, httpOnly 고객 세션
- ADMIN_SECRET 기반 httpOnly 관리자 세션
- TossPayments 결제 준비·승인·웹훅 Route Handler

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

```bash
npm run lint
npm run build
```

## 환경변수

전체 예시는 `.env.example`을 확인합니다. 서버 필수값은 브라우저에 노출되지 않는 이름으로 설정합니다.

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_CALLBACK_URL=http://localhost:3000/api/auth/naver/callback
AUTH_SESSION_SECRET=

ADMIN_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

`FIREBASE_PRIVATE_KEY`는 큰따옴표로 감싼 `\n` 이스케이프 형식도 지원합니다.

## Firebase 연결과 Seed

1. Firebase 서비스 계정에서 `project_id`, `client_email`, `private_key`를 확인합니다.
2. 로컬은 `.env.local`, Vercel은 Project Settings의 Environment Variables에 등록합니다.
3. Firestore Database를 Native mode로 생성합니다.
4. 아래 명령으로 기본 상품·일정·공지·사이트 설정을 입력합니다.

```bash
npm run seed:firestore
```

관리자 로그인 후 `/admin/products`의 **고객 요청 최신 자료 반영** 버튼으로도 Vercel 서버에서 같은 작업을 실행할 수 있습니다. 반복 실행해도 기존 회차의 예약 인원과 마감 상태는 초기화하지 않습니다.

주요 컬렉션:

- `users`
- `products`
- `schedules`
- `reservations`
- `payments`
- `notices`
- `siteSettings`
- `adminLogs`

브라우저가 Firestore를 직접 읽고 쓰지 않으며, 중요한 작업은 Route Handler와 Admin SDK에서 처리합니다. Firestore Rules는 deny all로 운영할 수 있습니다.

## 예약 구조

- 성인 / 청소년 / 유치원생 인원을 구분합니다.
- 여러 체험과 숙박을 예약번호 하나로 신청할 수 있습니다.
- 체험은 인원 단위, 숙박은 객실 1실 단위로 정원을 차감합니다.
- 예약 생성과 모든 회차의 정원 증가는 Firestore transaction으로 처리합니다.
- 취소 시 각 회차 정원을 transaction으로 복구하며 중복 복구를 막습니다.
- 개발 환경에 Firebase Admin 값이 없으면 공개 상품·일정 화면만 seed 데이터로 미리 볼 수 있습니다.

## 관리자 로그인

- URL: `/admin/login`
- `ADMIN_SECRET` 비밀키 로그인 또는 `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` 로그인을 사용합니다.
- `ADMIN_PASSWORD_HASH`는 비밀번호의 SHA-256 16진수 값입니다.
- 관리자 API는 서버의 httpOnly admin session cookie가 없으면 `401`을 반환합니다.

## 결제

TossPayments용 아래 API가 준비되어 있습니다.

- `POST /api/payments/toss/prepare`
- `POST /api/payments/toss/confirm`
- `POST /api/payments/toss/webhook`

운영 전 TossPayments 계약·키 등록, 성공/실패 URL 확인, 웹훅 시크릿 검증과 실제 결제 시나리오 테스트가 필요합니다. 결제 금액은 클라이언트가 보낸 값을 믿지 않고 예약 문서의 `totalAmount`를 기준으로 검증합니다.

## 운영 전 확인 사항

- 가격 범위 상품의 최종 금액 선택 방식
- 유치원 참여 가능 여부가 미확정인 일부 체험
- 숙박 기준 인원 초과 시 20,000원의 정확한 부과 단위
- 결제 선행 또는 관리자 확인 후 결제 중 최종 운영 흐름
- 객실별 대표 내부 사진
- 환불 규정과 사업자 정보
- 관리자 공지·사이트 설정의 Firestore 편집 전환
