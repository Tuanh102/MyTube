import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { userModel } from "@/lib/models/user";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Số điện thoại",
      credentials: {
        phone: { label: "Số điện thoại", type: "text" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        
        const user = await userModel.findByPhoneAndPassword(credentials.phone, credentials.password);
        
        if (user) {
          return {
            id: user.user_id.toString(),
            name: user.username,
            username: user.username,
            email: user.email,
            image: user.avatar,
            avatar: user.avatar,
            role: user.role
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "google") {
        const googleId = profile.sub;
        const existingUser = await userModel.findByGoogleId(googleId);
        
        if (!existingUser) {
          await userModel.createFromGoogle({
            google_id: googleId,
            username: profile.name,
            email: profile.email,
            avatar: profile.picture
          });
        }
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.avatar = token.avatar;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        // Nếu là lần đầu đăng nhập (có user object)
        token.sub = user.id;
        token.avatar = user.image || user.avatar;
        token.username = user.name || user.username;
        token.role = user.role;

        // Nếu đăng nhập qua Google, chúng ta cần tìm ID thực trong DB của mình
        if (account?.provider === "google") {
          const dbUser = await userModel.findByGoogleId(user.id);
          if (dbUser) {
            token.sub = dbUser.user_id.toString();
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.avatar = dbUser.avatar;
          }
        }
      }
      return token;
    }
  },
  pages: {
    signIn: "/login", // Optional: Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET || "mytube_secret_key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
