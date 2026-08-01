import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SalespersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "salesperson") redirect("/dashboard");

  return <>{children}</>;
}
