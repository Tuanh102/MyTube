import RegisterPage from "@/views/pages/RegisterPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký - MyTube",
};

export default function Page() {
  return <RegisterPage />;
}
