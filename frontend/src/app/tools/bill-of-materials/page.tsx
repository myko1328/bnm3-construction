import type { Metadata } from "next";
import BillOfMaterials from "./BillOfMaterials";

export const metadata: Metadata = {
  title: "Bill of Materials Worksheet | BNM3 Construction",
  description: "Build a printable, indicative project bill of materials and quantities with repeatable cost rows.",
};

export default function BillOfMaterialsPage() {
  return <BillOfMaterials />;
}
