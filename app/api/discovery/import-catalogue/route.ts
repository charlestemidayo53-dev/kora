import { NextResponse } from "next/server";
import { importCatalogueFromMock } from "@/lib/discovery/catalogue-import";

export async function POST() {
  const result = await importCatalogueFromMock();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    message: `Imported ${result.created.length}, skipped ${result.skipped.length}`,
    created: result.created,
    skipped: result.skipped,
  });
}
