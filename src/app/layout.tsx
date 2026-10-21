import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Activity Weather",
  description: "Hourly scores for outdoor activities, based on the forecast.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
