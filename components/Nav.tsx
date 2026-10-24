"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarCheck, LogOut, Mail, Repeat, Search, Settings } from "lucide-react";
import { browser } from "@/lib/browser";

const ITEMS = [
  { href: "/", label: "Analytics", icon: BarChart3 }, { href: "/leads", label: "Leads", icon: Search }, { href: "/meetings", label: "Meetings", icon: CalendarCheck },
  { href: "/followups", label: "Follow-ups", icon: Repeat }, { href: "/emails", label: "Email activity", icon: Mail }, { href: "/settings", label: "Settings", icon: Settings },
];
export default function Nav() {
  const path = usePathname(), router = useRouter();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-gradient-to-b from-teal-700 to-teal-600 p-4 text-white md:flex">
        <div className="mb-8 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg font-extrabold">L</span><div><div className="font-bold leading-tight">LeadPilot</div><div className="text-xs text-teal-100">Growth studio</div></div></div>
        <nav className="space-y-1">{ITEMS.map(i => <Link key={i.href} href={i.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active(i.href) ? "bg-white text-teal-800 shadow" : "text-teal-50 hover:bg-white/10"}`}><i.icon size={18} />{i.label}</Link>)}</nav>
        <button onClick={async () => { await browser().auth.signOut(); router.push("/login"); router.refresh(); }} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-teal-50 hover:bg-white/10"><LogOut size={18} />Sign out</button>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white md:hidden">
        {ITEMS.map(i => <Link key={i.href} href={i.href} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${active(i.href) ? "text-teal-700" : "text-slate-500"}`}><i.icon size={18} />{i.label.split(" ")[0]}</Link>)}
      </nav>
    </>
  );
}
