import { Header } from "@/components/layout/header";
// import { AuthProvider } from "@/context/auth-provider";
// import { getAuthenticatedUser } from "@/services/auth.service";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const cookieStore = await cookies();
  // const accessToken = cookieStore.get("accessToken")?.value
  // if (!accessToken) {
  //   redirect("/login");
  // }
  // const user = await getAuthenticatedUser(accessToken)
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}