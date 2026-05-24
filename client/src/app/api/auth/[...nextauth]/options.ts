import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Số điện thoại", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        
        try {
          const res = await fetch("http://127.0.0.1:5000/users/login", {
            method: "POST",
            body: JSON.stringify({
              phone: credentials.phone,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const user = await res.json();

          if (res.ok && user) {
            return {
              id: user._id,
              name: user.username,
              email: user.email,
              image: user.avatar,
              purchased_videos: user.purchased_videos || []
            };
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch("http://127.0.0.1:5000/users/google-login", {
            method: "POST",
            body: JSON.stringify({
              google_id: user.id,
              username: user.name || "User",
              email: user.email || "",
              avatar: user.image || "",
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const dbUser = await res.json();
            user.id = dbUser._id; // Update NextAuth user id with MongoDB id
            (user as any).is_premium = dbUser.is_premium || false;
            (user as any).purchased_videos = dbUser.purchased_videos || [];
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google login save error:", error);
          return false;
        }
      }
      
      if (account?.provider === "facebook") {
        try {
          console.log("[NEXTAUTH FACEBOOK] Thông tin user từ FB:", {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          });

          const res = await fetch("http://127.0.0.1:5000/users/facebook-login", {
            method: "POST",
            body: JSON.stringify({
              facebook_id: user.id,
              username: user.name || "Facebook User",
              email: user.email || "",
              avatar: user.image || "",
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const dbUser = await res.json();
            console.log("[NEXTAUTH FACEBOOK] Đăng ký/đăng nhập thành công ở NestJS:", dbUser._id);
            user.id = dbUser._id;
            (user as any).is_premium = dbUser.is_premium || false;
            (user as any).purchased_videos = dbUser.purchased_videos || [];
            return true;
          } else {
            const errText = await res.text();
            console.error("[NEXTAUTH FACEBOOK ERROR] NestJS trả về mã lỗi:", res.status, errText);
            return false;
          }
        } catch (error: any) {
          console.error("[NEXTAUTH FACEBOOK ERROR] Lỗi kết nối hoặc xử lý:", error.message);
          return false;
        }
      }

      if (account?.provider === "github") {
        try {
          console.log("[NEXTAUTH GITHUB] Thông tin user từ GitHub:", {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          });

          const res = await fetch("http://127.0.0.1:5000/users/github-login", {
            method: "POST",
            body: JSON.stringify({
              github_id: user.id,
              username: user.name || user.email?.split('@')[0] || "Github User",
              email: user.email || "",
              avatar: user.image || "",
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const dbUser = await res.json();
            console.log("[NEXTAUTH GITHUB] Đăng ký/đăng nhập thành công ở NestJS:", dbUser._id);
            user.id = dbUser._id;
            (user as any).is_premium = dbUser.is_premium || false;
            (user as any).purchased_videos = dbUser.purchased_videos || [];
            return true;
          } else {
            const errText = await res.text();
            console.error("[NEXTAUTH GITHUB ERROR] NestJS trả về mã lỗi:", res.status, errText);
            return false;
          }
        } catch (error: any) {
          console.error("[NEXTAUTH GITHUB ERROR] Lỗi kết nối hoặc xử lý:", error.message);
          return false;
        }
      }

      if (account?.provider === "discord") {
        try {
          console.log("[NEXTAUTH DISCORD] Thông tin user từ Discord:", {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          });

          const res = await fetch("http://127.0.0.1:5000/users/discord-login", {
            method: "POST",
            body: JSON.stringify({
              discord_id: user.id,
              username: user.name || "Discord User",
              email: user.email || "",
              avatar: user.image || "",
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const dbUser = await res.json();
            console.log("[NEXTAUTH DISCORD] Đăng ký/đăng nhập thành công ở NestJS:", dbUser._id);
            user.id = dbUser._id;
            (user as any).is_premium = dbUser.is_premium || false;
            (user as any).purchased_videos = dbUser.purchased_videos || [];
            return true;
          } else {
            const errText = await res.text();
            console.error("[NEXTAUTH DISCORD ERROR] NestJS trả về mã lỗi:", res.status, errText);
            return false;
          }
        } catch (error: any) {
          console.error("[NEXTAUTH DISCORD ERROR] Lỗi kết nối hoặc xử lý:", error.message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.is_premium = (user as any).is_premium || false;
        token.purchased_videos = (user as any).purchased_videos || [];
        token.premium_type = (user as any).premium_type || null;
        token.premium_purchased_at = (user as any).premium_purchased_at || null;
        token.premium_expires_at = (user as any).premium_expires_at || null;
        if (account) {
          token.provider = account.provider;
        }

        // Dò tìm và đồng bộ MongoDB ID thực tế từ Backend nếu đăng nhập bằng OAuth
        if (account && account.provider !== "credentials") {
          try {
            const res = await fetch(`http://127.0.0.1:5000/users/profile/${user.id}`);
            if (res.ok) {
              const text = await res.text();
              const dbUser = text ? JSON.parse(text) : null;
              if (dbUser && dbUser._id) {
                token.id = dbUser._id; // Ghi đè bằng MongoDB ID thực tế từ DB!
                token.is_premium = dbUser.is_premium || false;
                token.purchased_videos = dbUser.purchased_videos || [];
                token.premium_type = dbUser.premium_type || null;
                token.premium_purchased_at = dbUser.premium_purchased_at || null;
                token.premium_expires_at = dbUser.premium_expires_at || null;
                console.log(`[NEXTAUTH JWT OAuth SYNC] Đồng bộ thành công MongoDB ID (${token.id}) cho ${account.provider}`);
              }
            }
          } catch (syncErr) {
            console.error("[NEXTAUTH JWT OAuth SYNC ERROR]:", syncErr);
          }
        }
      }
      
      // Hỗ trợ trigger update() thủ công từ Client-side
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // 1. Lấy userId từ token (id tùy chỉnh hoặc sub mặc định của OAuth)
        let userId = token.id || token.sub;

        // 2. Dự phòng (Fallback): Dò tìm ID bằng Email hoặc Username để khôi phục
        if (!userId) {
          const avatar = session.user.image || "";
          if (avatar.includes("facebook") || avatar.includes("fbsbx.com")) {
            const match = avatar.match(/asid=(\d+)/);
            if (match && match[1]) {
              const fbId = match[1];
              try {
                const fbRes = await fetch(`http://127.0.0.1:5000/users/profile/${fbId}`);
                if (fbRes.ok) {
                  const text = await fbRes.text();
                  const dbUser = text ? JSON.parse(text) : null;
                  if (dbUser && dbUser._id) {
                    userId = dbUser._id;
                    console.log("[NEXTAUTH SESSION FALLBACK] Đã khôi phục MongoDB ID từ Facebook ASID trong avatar:", userId);
                  }
                }
              } catch (fbErr) {
                console.error("[NEXTAUTH SESSION FALLBACK FB ASID ERROR]:", fbErr);
              }
            }
          }
        }

        if (!userId && session.user.email) {
          try {
            const emailRes = await fetch(`http://127.0.0.1:5000/users/profile-by-email?email=${encodeURIComponent(session.user.email)}`);
            if (emailRes.ok) {
              const text = await emailRes.text();
              const dbUser = text ? JSON.parse(text) : null;
              if (dbUser && dbUser._id) {
                userId = dbUser._id;
                console.log("[NEXTAUTH SESSION FALLBACK] Đã khôi phục thành công MongoDB ID từ Email:", userId);
              }
            }
          } catch (emailErr) {
            console.error("[NEXTAUTH SESSION FALLBACK ERROR]:", emailErr);
          }
        }

        // Dò tìm dự phòng bằng Username (Tên hiển thị) nếu Email trống hoặc không tìm được
        if (!userId && session.user.name) {
          try {
            const userRes = await fetch(`http://127.0.0.1:5000/users/profile-by-username?username=${encodeURIComponent(session.user.name)}`);
            if (userRes.ok) {
              const text = await userRes.text();
              const dbUser = text ? JSON.parse(text) : null;
              if (dbUser && dbUser._id) {
                userId = dbUser._id;
                console.log("[NEXTAUTH SESSION FALLBACK] Đã khôi phục thành công MongoDB ID từ Username:", userId);
              }
            }
          } catch (userErr) {
            console.error("[NEXTAUTH SESSION FALLBACK USERNAME ERROR]:", userErr);
          }
        }

        // Gán chính xác ID vào session
        if (userId) {
          (session.user as any).id = userId;
        }

        // 3. Đồng bộ thông tin Premium và Purchased Videos thời gian thực từ MongoDB
        if (userId) {
          try {
            let res = await fetch(`http://127.0.0.1:5000/users/profile/${userId}`);
            let dbUser = null;
            if (res.ok) {
              const text = await res.text();
              dbUser = text ? JSON.parse(text) : null;
            }

            // Nếu không tìm thấy user trong DB (ví dụ DB bị xóa/reset) nhưng đang có session OAuth
            let provider = token.provider;
            if (!dbUser && token.sub) {
              if (!provider) {
                const avatar = session.user.image || "";
                if (avatar.includes("facebook") || avatar.includes("fbsbx.com")) {
                  provider = "facebook";
                } else if (avatar.includes("googleusercontent.com")) {
                  provider = "google";
                } else if (avatar.includes("githubusercontent.com")) {
                  provider = "github";
                } else if (avatar.includes("discordapp") || avatar.includes("discord")) {
                  provider = "discord";
                }
              }

              if (provider && provider !== "credentials") {
                console.log(`[SESSION RECREATE] Không tìm thấy user ${userId} trong DB. Tiến hành tự động tạo lại cho provider: ${provider}`);
                
                const loginPayload: any = {
                  username: session.user.name || "OAuth User",
                  email: session.user.email || "",
                  avatar: session.user.image || "",
                };
                
                let loginUrl = "";
                if (provider === "google") {
                  loginUrl = "http://127.0.0.1:5000/users/google-login";
                  loginPayload.google_id = token.sub;
                } else if (provider === "facebook") {
                  loginUrl = "http://127.0.0.1:5000/users/facebook-login";
                  loginPayload.facebook_id = token.sub;
                } else if (provider === "github") {
                  loginUrl = "http://127.0.0.1:5000/users/github-login";
                  loginPayload.github_id = token.sub;
                } else if (provider === "discord") {
                  loginUrl = "http://127.0.0.1:5000/users/discord-login";
                  loginPayload.discord_id = token.sub;
                }

                if (loginUrl) {
                  try {
                    const recreateRes = await fetch(loginUrl, {
                      method: "POST",
                      body: JSON.stringify(loginPayload),
                      headers: { "Content-Type": "application/json" },
                    });
                    
                    if (recreateRes.ok) {
                      dbUser = await recreateRes.json();
                      console.log(`[SESSION RECREATE SUCCESS] Đã tự động tạo lại user trong DB thành công. ID mới: ${dbUser._id}`);
                    } else {
                      const errTxt = await recreateRes.text();
                      console.error(`[SESSION RECREATE FAILED]: Status ${recreateRes.status}`, errTxt);
                    }
                  } catch (recreateErr: any) {
                    console.error("[SESSION RECREATE ERROR]:", recreateErr);
                  }
                }
              }
            }

            if (dbUser) {
              if (dbUser._id) {
                (session.user as any).id = dbUser._id;
              }
              (session.user as any).is_premium = dbUser.is_premium || false;
              (session.user as any).purchased_videos = dbUser.purchased_videos || [];
              (session.user as any).premium_type = dbUser.premium_type || null;
              (session.user as any).premium_purchased_at = dbUser.premium_purchased_at || null;
              (session.user as any).premium_expires_at = dbUser.premium_expires_at || null;
            } else {
              (session.user as any).is_premium = token.is_premium || false;
              (session.user as any).purchased_videos = token.purchased_videos || [];
              (session.user as any).premium_type = token.premium_type || null;
              (session.user as any).premium_purchased_at = token.premium_purchased_at || null;
              (session.user as any).premium_expires_at = token.premium_expires_at || null;
            }
          } catch (err: any) {
            (session.user as any).is_premium = token.is_premium || false;
            (session.user as any).purchased_videos = token.purchased_videos || [];
            (session.user as any).premium_type = token.premium_type || null;
            (session.user as any).premium_purchased_at = token.premium_purchased_at || null;
            (session.user as any).premium_expires_at = token.premium_expires_at || null;
          }
        } else {
          (session.user as any).is_premium = token.is_premium || false;
          (session.user as any).purchased_videos = token.purchased_videos || [];
          (session.user as any).premium_type = token.premium_type || null;
          (session.user as any).premium_purchased_at = token.premium_purchased_at || null;
          (session.user as any).premium_expires_at = token.premium_expires_at || null;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
