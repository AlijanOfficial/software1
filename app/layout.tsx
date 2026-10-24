import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "LeadPilot", description: "Find local businesses that need a better website, review them and reach out responsibly." };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
