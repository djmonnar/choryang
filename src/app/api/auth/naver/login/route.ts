import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getNaverStateCookieOptions, naverStateCookieName } from "@/lib/auth/session";

const defaultClientId = "HNHZ57WUKukXk9sRRDSf";

function getCallbackUrl(request: Request) {
  return process.env.NAVER_CALLBACK_URL || new URL("/api/auth/naver/callback", request.url).toString();
}

export async function GET(request: Request) {
  const clientId = process.env.NAVER_CLIENT_ID || defaultClientId;
  const state = randomBytes(24).toString("hex");
  const authorizationUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", getCallbackUrl(request));
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(naverStateCookieName, state, getNaverStateCookieOptions());
  return response;
}
