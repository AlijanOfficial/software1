import Nav from "@/components/Nav";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen"><Nav /><main className="mx-auto max-w-6xl p-4 pb-24 md:ml-60 md:max-w-none md:p-8 md:pb-8">{children}</main></div>;
}
