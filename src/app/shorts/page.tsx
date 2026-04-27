import ShortsPage from "@/views/pages/ShortsPage";
import { videoModel } from "@/lib/models/video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shorts - MyTube",
};

export default async function Page() {
  const shorts = await videoModel.getShorts();

  return <ShortsPage shorts={shorts} />;
}
