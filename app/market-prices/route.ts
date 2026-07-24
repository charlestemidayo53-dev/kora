import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a Nigerian agricultural commodity market price expert.
Return ONLY a valid JSON array. No markdown, no code fences, no explanation — just raw JSON.
Each object must have exactly:
  "name": short product name (max 12 chars)
  "price": price in Naira as a plain number (e.g. 45000)
  "unit": unit string (e.g. "per 100kg bag")
  "change": "up", "down", or "flat"
  "pct": e.g. "+2.3%" or "-1.1%" or "0%"`,
        messages: [
          {
            role: "user",
            content: `Give me current Nigerian wholesale market prices as of ${today} for:
1. Yam (per tuber)
2. Maize (per 100kg bag)
3. Tomatoes (per 50kg basket)
4. Cassava (per 100kg)
5. Groundnut (per 100kg)
6. Rice (per 50kg bag)
7. Onions (per 50kg bag)
8. Ginger (per 100kg)
9. Soya Beans (per 100kg)
10. Palm Oil (per 25 litres)`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const prices = JSON.parse(clean);

    return NextResponse.json(prices);
  } catch (err) {
    console.error("market-prices error:", err);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}