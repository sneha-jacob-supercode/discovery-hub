export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>;
}
