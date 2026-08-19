// Re-exporta desde el módulo compartido para mantener compatibilidad
// con cualquier importación directa desde esta ruta.
export {
  InventoryProvider,
  useInventory,
} from "@/app/(dashboard)/_shared/inventory/inventory-context";
