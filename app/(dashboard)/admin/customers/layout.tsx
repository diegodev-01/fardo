import { ReactNode } from "react";
import CustomerAside from "./components/customer-aside";
import { getCustomers } from "@/lib/services/customer.service";

export default async function CustomersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <CustomerAside initialCustomers={customers} />

      <main className="flex flex-col h-full w-full flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
