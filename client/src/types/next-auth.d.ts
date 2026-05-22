import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      avatar?: string;
      username?: string;
      is_premium?: boolean;
      purchased_videos?: string[];
      premium_type?: string | null;
      premium_purchased_at?: string | Date | null;
      premium_expires_at?: string | Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    avatar?: string;
    username?: string;
    is_premium?: boolean;
    purchased_videos?: string[];
    premium_type?: string | null;
    premium_purchased_at?: string | Date | null;
    premium_expires_at?: string | Date | null;
  }
}
