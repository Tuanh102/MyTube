export const dynamic = 'force-dynamic';
import StudioPage from "@/views/pages/StudioPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "MyTube Studio",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <StudioPage />
    </Suspense>
  );
}
