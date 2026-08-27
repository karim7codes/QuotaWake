import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "@fontsource/calistoga/index.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/700.css";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = { title: "QuotaWake | GenLayer", description: "Trace the catch through every zone." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
