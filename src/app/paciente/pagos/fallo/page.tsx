// Payment failure redirect page
import { redirect } from "next/navigation";

export default function PagoFalloPage() {
  redirect("/paciente/pagos?status=rejected");
}
