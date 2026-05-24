import PrivyProvider from "@/lib/privy/PrivyProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PrivyProvider>{children}</PrivyProvider>;
}
