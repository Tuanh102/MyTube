import LoginPage from "@/views/pages/LoginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - MyTube",
};

export default function Page() {
  return <LoginPage />;
}
