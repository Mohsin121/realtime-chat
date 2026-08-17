import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/context/auth-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />

      <main>{children}</main>
    </div>
  );
}