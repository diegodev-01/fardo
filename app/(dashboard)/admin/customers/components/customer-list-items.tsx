// app/admin/customers/_components/customer-list-item.tsx
"use client";

import Link from "next/link";
import { CardComponent } from "@/components/common/card-component";
import { CopyableEmail } from "@/components/common/copyable-email";
import { ICustomer } from "@/lib/models/customer.model";
import { formatDate } from "@/lib/utils/formatters";

type CustomerListItemProps = {
  customer: ICustomer;
  isSelected: boolean;
};

const CustomerListItem = ({ customer, isSelected }: CustomerListItemProps) => {
  return (
    <li>
      <Link
        href={`/admin/customers/${customer._id}`}
        className="block focus:outline-none"
      >
        <CardComponent isSelected={isSelected}>
          <h3 className="font-mono text-sm">
            {customer.name} {customer.lastname}
          </h3>
          <p className="font-mono text-xs text-text/70">{customer.phone}</p>
          <div className="flex flex-wrap justify-between items-center gap-y-1 mt-2">
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">
                Ubicación:
              </h5>
              {customer.address?.department &&
                `${customer.address.department}, `}
              {customer.address?.city}
            </span>
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">
                Creación:
              </h5>
              {formatDate(customer.createdAt)}
            </span>
            <span
              className="font-mono text-sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <h5 className="text-[10px] font-medium text-text/50">Email:</h5>
              <CopyableEmail email={customer.email} />
            </span>
          </div>
        </CardComponent>
      </Link>
    </li>
  );
};

export default CustomerListItem;
