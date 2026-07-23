import { SignupForm } from "@/components/ui/form/signup-form"; // El que ya tienes creado

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Crear una cuenta</h1>
        <SignupForm />
      </div>
    </div>
  );
}
