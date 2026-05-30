import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authReturnToCookieName, getNaverStateCookieOptions, naverStateCookieName, setAuthSession } from "@/lib/auth/session";
import { upsertNaverUser } from "@/services/users.service";
import type { NaverProfile } from "@/types/user";

const defaultClientId = "HNHZ57WUKukXk9sRRDSf";

interface NaverTokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
  error?: string;
  error_description?: string;
}

interface NaverProfileResponse {
  resultcode: string;
  message: string;
  response?: NaverProfile;
}

function redirectWithError(request: Request, reason: string) {
  const url = new URL("/mypage", request.url);
  url.searchParams.set("authError", reason);
  return NextResponse.redirect(url);
}

function getCallbackUrl(request: Request) {
  return process.env.NAVER_CALLBACK_URL || new URL("/api/auth/naver/callback", request.url).toString();
}

async function requestAccessToken(request: Request, code: string, state: string) {
  const clientId = process.env.NAVER_CLIENT_ID || defaultClientId;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientSecret) throw new Error("NAVER_CLIENT_SECRET 환경변수가 필요합니다.");

  const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("state", state);
  tokenUrl.searchParams.set("redirect_uri", getCallbackUrl(request));

  const response = await fetch(tokenUrl, { cache: "no-store" });
  const data = (await response.json()) as NaverTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "네이버 access token 발급에 실패했습니다.");
  }
  return data.access_token;
}

async function requestProfile(accessToken: string) {
  const response = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const data = (await response.json()) as NaverProfileResponse;
  if (!response.ok || data.resultcode !== "00" || !data.response?.id) {
    throw new Error(data.message || "네이버 프로필 조회에 실패했습니다.");
  }
  return data.response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(naverStateCookieName)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return redirectWithError(request, "invalid_state");
  }

  try {
    const accessToken = await requestAccessToken(request, code, state);
    const profile = await requestProfile(accessToken);
    const user = await upsertNaverUser(profile);
    await setAuthSession(user);

    const returnTo = cookieStore.get(authReturnToCookieName)?.value || "/mypage";
    const destination = new URL(returnTo.startsWith("/") ? returnTo : "/mypage", request.url);
    destination.searchParams.set("login", "success");
    const response = NextResponse.redirect(destination);
    response.cookies.set(naverStateCookieName, "", {
      ...getNaverStateCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(authReturnToCookieName, "", {
      ...getNaverStateCookieOptions(),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Naver login failed", error);
    return redirectWithError(request, "naver_login_failed");
  }
}
