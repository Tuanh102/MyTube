import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MyTube - Trung tâm kiểm duyệt Staff",
    description: "Trang làm việc nội bộ dành cho nhân viên kiểm duyệt MyTube",
    icons: {
        icon: "/assets/img/logoMyTube.png",
        apple: "/assets/img/logoMyTube.png",
    },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
