# choryang

경남 사천시 곤명면 초량길 27-3에 있는 **다슬기초량마을**의 체험 예약 홈페이지와 관리자 예약관리 시스템 MVP입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Firebase Authentication / Firestore / Storage 연결 준비
- Mock repository 기반 예약/관리자 기능
- MockPaymentProvider + PortOne/TossPayments adapter placeholder

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

빌드 확인:

```bash
npm run build
npm run lint
```

## 환경변수 예시

`.env.example`을 복사해 `.env.local`로 사용합니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_PAYMENT_PROVIDER=mock
PORTONE_STORE_ID=
PORTONE_CHANNEL_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

NEXT_PUBLIC_USE_MOCK_AUTH=true
```

## Firebase 연결 방법

1. Firebase 콘솔에서 Web App을 생성합니다.
2. Authentication에서 Email/Password provider를 켭니다.
3. Firestore Database와 Storage를 생성합니다.
4. `.env.local`에 Firebase Web SDK 설정값을 입력합니다.
5. `src/lib/firebase/client.ts`의 `getFirebaseServices()`를 사용해 Auth, Firestore, Storage를 가져옵니다.
6. 실제 운영 전에는 `src/services/firestore-reservations.repository.ts`의 transaction 구조를 기준으로 `products`, `schedules`, `reservations`, `payments`, `notices`, `siteSettings`, `adminLogs` repository를 확장합니다.

## 관리자 로그인 테스트

개발용 mock auth가 켜져 있으면 아래 계정으로 로그인할 수 있습니다.

- URL: `/admin/login`
- 이메일: `admin@choryang.local`
- 비밀번호: `choryang1234`

실제 Firebase Auth를 사용할 때는 `NEXT_PUBLIC_USE_MOCK_AUTH=false`로 바꾸고 Firebase 로그인 구현을 연결하면 됩니다.

## Seed 데이터

- 상품: `src/data/seedProducts.ts`
- 일정: `src/data/seedSchedules.ts`
- 공지: `src/data/seedNotices.ts`
- 사이트 설정: `src/data/siteSettings.ts`

초기 상품은 PRD의 33개 상품을 모두 포함합니다. 가격 미확정 상품은 `priceType: "inquiry"`로 두어 고객 화면에서 “문의 후 안내”로 표시합니다.

## PG 연동 다음 단계

1. `src/lib/payment/providers.ts`의 `PortOnePaymentProvider` 또는 `TossPaymentProvider`를 실제 SDK/API 호출로 교체합니다.
2. 서버 라우트 또는 Cloud Functions에서 결제 검증 webhook을 받습니다.
3. 결제 성공 시 `payments.status=paid`, `reservations.status=paid` 또는 `confirmed`로 갱신합니다.
4. 환불 요청/취소는 관리자 승인 흐름과 PG cancel API를 연결합니다.

## 아직 mock인 부분

- 예약, 상품, 일정, 공지, 결제, 설정 저장은 브라우저 `localStorage` mock입니다.
- Firebase Auth 로그인은 개발용 mock 계정입니다.
- 지도는 placeholder입니다. Naver/Kakao 지도 API로 교체해야 합니다.
- PG 결제는 MockPaymentProvider입니다.
- 계좌번호와 환불 규정은 placeholder입니다.
- `public/images` 이미지는 교체 가능한 임시 이미지입니다. 실제 마을 사진으로 교체하세요.

## 운영 전 확인 사항

- Firebase 보안 규칙과 관리자 권한 custom claims
- Firestore transaction 기반 정원 초과 방지
- 개인정보처리방침, 환불 규정, 계좌 정보 확정
- 결제 webhook 검증과 관리자 입금 확인 프로세스
- 실제 사진, 지도 API, 접근성/모바일 QA
