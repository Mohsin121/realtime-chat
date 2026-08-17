import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Realtime Chat
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Connect and chat in real time.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}