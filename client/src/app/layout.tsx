import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/views/components/Providers";
import MainLayout from "@/views/components/MainLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MyTube - Nền tảng chia sẻ video",
  description: "Bản clone YouTube hiện đại xây dựng bằng Next.js và TSX",
  icons: {
    icon: "/assets/img/logoMyTube.png",
    apple: "/assets/img/logoMyTube.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  let followedChannels: any[] = [];
  if (user) {
    followedChannels = []; 
  }

  return (
    <html lang="vi">
      <body className={`${outfit.className} bg-[#0f0f0f] text-white antialiased`}>
        <Providers>
          <MainLayout 
            user={user} 
            followedChannels={followedChannels} 
          >
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
