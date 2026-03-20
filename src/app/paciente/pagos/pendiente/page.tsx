// Payment pending redirect page
import { redirect } from "next/navigation";

export default function PagoPendientePage() {
  redirect("/paciente/pagos?status=pending");
}
