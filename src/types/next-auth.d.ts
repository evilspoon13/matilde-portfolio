import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    jwtToken?: string;
    role?: string;
    user: {
      id?: string;
      googleId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    jwtToken?: string;
    role?: string;
    googleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    jwtToken?: string;
    role?: string;
    googleId?: string;
  }
}
