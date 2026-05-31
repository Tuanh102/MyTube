import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MyTube - Bảng điều hành Admin",
    description: "Trang quản trị nội bộ dành cho Admin của MyTube",
    icons: {
        icon: "/assets/img/logoMyTube.png",
        apple: "/assets/img/logoMyTube.png",
    },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
