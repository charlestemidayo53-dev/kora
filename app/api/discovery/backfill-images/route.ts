import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchProductImage } from "@/lib/discovery/pexels-image-search";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "8", 10);

  const { data: products, error } = await supabase
    .from("catalogue_products")
    .select("id, name")
    .is("image_url", null)
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updated: string[] = [];
  const failed: string[] = [];

  for (const product of products || []) {
    const result = await searchProductImage(product.name);

    if (!result) {
      failed.push(product.name);
      continue;
    }

    const { error: updateError } = await supabase
      .from("catalogue_products")
      .update({
        image_url: result.image_url,
        image_source: result.image_source,
        image_credit: result.image_credit,
        image_credit_url: result.image_credit_url,
      })
      .eq("id", product.id);

    if (updateError) {
      failed.push(product.name + " (update error: " + updateError.message + ")");
    } else {
      updated.push(product.name);
    }
  }

  return NextResponse.json({
    message: "Updated " + updated.length + ", failed " + failed.length + ". Run again if products remain without images.",
    updated,
    failed,
  });
}
