import ResultsPage from "@/views/pages/ResultsPage";
import { videoController } from "@/lib/controllers/videoController";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search_query?: string }>;
}) {
  const { search_query } = await searchParams;
  const videos = await videoController.getHomePageData(search_query || '');

  return (
    <ResultsPage videos={videos} query={search_query || ''} />
  );
}
