import { LoginForm } from "@/components/ui/form/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}
