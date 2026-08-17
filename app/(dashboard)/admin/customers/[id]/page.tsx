import { getCustomerById } from "@/lib/services/customer.service";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold">
          {customer.name} {customer.lastname}
        </h2>
        <p className="text-xs font-mono text-muted-foreground">
          ID: {String(customer._id)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
        <div className="p-3 border border-border rounded-md bg-muted/30">
          <span className="text-xs text-text/50 block">Teléfono</span>
          <span>{customer.phone || "Sin registrar"}</span>
        </div>
      </div>
    </div>
  );
}
