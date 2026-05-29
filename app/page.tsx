import { redirect } from "next/navigation";

// La raíz redirige al home.
// El middleware maneja si hay sesión o no.
export default function RootPage() {
  redirect("/home");
}
