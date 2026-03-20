// Payment success redirect page
import { redirect } from "next/navigation";

export default function PagoExitoPage() {
  redirect("/paciente/pagos?status=approved");
}
