import type { Metadata } from "next";
import Confirmar from "@/components/admin/Confirmar";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Painel da redação", template: "%s | Painel Jornal Marabá" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Confirmar />
      {children}
    </>
  );
}
