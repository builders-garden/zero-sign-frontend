import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  PlusCircle,
  Download,
  FilePlus2,
  List,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/create", label: "Create ZK Safe", icon: PlusCircle },
  //{ href: "/app/import", label: "Import ZK Safe", icon: Download },
  { href: "/app/proposal/new", label: "Create Proposal", icon: FilePlus2 },
  { href: "/app/proposals", label: "Proposals", icon: List },
  { href: "/app/help", label: "How it works", icon: HelpCircle },
];

export function Sidebar({ connectedSafe }: { connectedSafe?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-neutral-900 border-r border-neutral-800 py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold tracking-wide">ZeroSig</span>
      </div>
      {connectedSafe && (
        <div className="mb-8 bg-neutral-800 border border-green-500 rounded-lg px-3 py-2 text-green-400 text-xs break-all">
          <span className="font-semibold">Connected ZK Safe:</span>
          <br />
          {connectedSafe}
        </div>
      )}
      <nav className="flex flex-col gap-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-neutral-200 hover:bg-green-600/10 hover:text-green-400",
              pathname === href && "bg-green-600/20 text-green-400"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
