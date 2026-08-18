import { getOrderById } from "@/lib/services/orders.service";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-2 sm:p-6 pb-4 border-b border-border shrink-0 bg-background">
        <Link
          href="/admin/orders"
          className="md:hidden shrink-0 text-xs font-mono text-text/60 hover:text-text px-2 py-1 border border-border rounded-md w-fit"
        >
          ← Volver
        </Link>
      </div>
      <div>
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-bold">
            {order.name} {order.lastname}
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            ID: {String(order._id)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
        <div className="p-3 border border-border rounded-md bg-muted/30">
          <span className="text-xs text-text/50 block">Teléfono</span>
          <span>{order.phone || "Sin registrar"}</span>
        </div>
      </div>
    </div>
  );
}
