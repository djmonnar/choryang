import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const requiredEnv = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const;

function getMissingFirebaseAdminEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

export function isFirebaseAdminConfigured() {
  return getMissingFirebaseAdminEnv().length === 0;
}

export function getFirebaseAdminApp(): App {
  const missing = getMissingFirebaseAdminEnv();
  if (missing.length > 0) {
    console.error(`[Firebase Admin] Missing required environment variables: ${missing.join(", ")}`);
    throw new Error("Firebase Admin SDK 환경변수가 설정되지 않았습니다.");
  }

  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}
