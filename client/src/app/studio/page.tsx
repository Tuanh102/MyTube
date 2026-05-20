import StudioPage from "@/views/pages/StudioPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyTube Studio",
};

export default function Page() {
  return <StudioPage />;
}
