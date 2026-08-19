import { InventoryForm } from "@/app/(dashboard)/_shared/inventory/components/inventory-form";

export default function SalespersonInventoryRegisterPage() {
  // hideSalespersonField=true porque el vendedor se asigna automáticamente
  return (
    <InventoryForm
      basePath="/salesperson/inventory"
      hideSalespersonField={true}
    />
  );
}
