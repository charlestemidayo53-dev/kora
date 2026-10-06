import { notFound, permanentRedirect } from "next/navigation";
import { getProductSeoById } from "@/lib/seo/data";
import { productPath } from "@/lib/seo/product";

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductSeoById(id);
  if (!product) notFound();
  permanentRedirect(productPath(product));
}