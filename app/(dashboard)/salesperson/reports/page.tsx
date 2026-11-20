import { redirect } from "next/navigation";

// Sales metrics are admin-only; keep the route from rendering an empty placeholder.
export default function SalespersonReportsPage() {
  redirect("/salesperson/inventory");
}
