import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { matchLocalImage } from "@/lib/discovery/local-image-map";

export async function POST() {
  const { data: products, error } = await supabase
    .from("catalogue_products")
    .select("id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updated: string[] = [];

  for (const product of products || []) {
    const localImage = matchLocalImage(product.name);
    if (!localImage) continue;

    const { error: updateError } = await supabase
      .from("catalogue_products")
      .update({
        image_url: localImage,
        image_source: "local-upload",
        image_credit: null,
        image_credit_url: null,
      })
      .eq("id", product.id);

    if (!updateError) {
      updated.push(product.name + " -> " + localImage);
    }
  }

  return NextResponse.json({
    message: "Matched and updated " + updated.length + " products with local images.",
    updated,
  });
}
