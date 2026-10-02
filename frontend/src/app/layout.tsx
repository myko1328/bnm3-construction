import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BNM3 Construction | LPG, Fire Safety & Industrial Electrical",
  description:
    "LPG, fire-safety, and industrial electrical systems for homes, businesses, and industrial facilities.",
};

export const viewport: Viewport = {
  themeColor: "#07166f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
