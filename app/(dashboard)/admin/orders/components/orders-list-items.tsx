"use client";

import { CardComponent } from "@/components/common/card-component";
import { CopyableEmail } from "@/components/common/copyable-email";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";

type OrdersListItemProps = {
  _id: string;
  customer?: {
    name?: string;
    lastname?: string;
    phone?: string;
  } | null;
  garment?: {
    name?: string;
    finalPrice?: number;
  } | null;
  createdAt?: Date | string;
  isSelected: boolean;
};

const OrderListItem = ({
  _id,
  customer,
  isSelected,
  garment,
  createdAt,
}: OrdersListItemProps) => {
  return (
    <li>
      <Link href={`/admin/orders/${_id}`} className="block focus:outline-none">
        <CardComponent isSelected={isSelected}>
          {/* 💡 Encadenamiento opcional con fallback */}
          <h3 className="font-mono text-sm">
            {garment?.name ?? "Prenda sin nombre"}
          </h3>

          <p className="font-mono text-xs text-text/70">
            {garment?.finalPrice != null
              ? `$${garment.finalPrice}`
              : "Sin precio"}
          </p>

          <div className="flex flex-wrap justify-between items-center gap-y-1 mt-2">
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Cliente:</h5>
              {customer?.name
                ? `${customer.name} ${customer.lastname ?? ""}`
                : "Sin cliente asignado"}
            </span>

            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">
                Creación:
              </h5>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>

            {customer?.phone && (
              <span
                className="font-mono text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <h5 className="text-[10px] font-medium text-text/50">
                  Teléfono:
                </h5>
                <CopyableEmail email={customer.phone} />
              </span>
            )}
          </div>
        </CardComponent>
      </Link>
    </li>
  );
};

export default OrderListItem;
