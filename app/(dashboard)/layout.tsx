import { MobileSidebar } from "@/components/common/mobile-sidebar";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <MobileSidebar
        userName={user?.name || undefined}
        userRole={user?.role || undefined}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="flex-1 w-full pt-16 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
