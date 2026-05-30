export type AuthProvider = "naver";

export interface ChoryangUser {
  id: string;
  provider: AuthProvider;
  naverId: string;
  name?: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  disconnectedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface NaverProfile {
  id: string;
  name?: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  profile_image?: string;
}

export type PublicUser = Pick<ChoryangUser, "id" | "provider" | "name" | "nickname" | "email" | "mobile" | "profileImage">;

export function toPublicUser(user: ChoryangUser): PublicUser {
  return {
    id: user.id,
    provider: user.provider,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    mobile: user.mobile,
    profileImage: user.profileImage,
  };
}
