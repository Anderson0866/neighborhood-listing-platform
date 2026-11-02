import { NextRequest, NextResponse } from "next/server";
import { propertyInputSchema } from "../../../schemas/property";
import { publicSupabaseConfig, supabaseHeaders } from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { url, key } = publicSupabaseConfig();
    const query = new URL("/rest/v1/properties", url);
    query.searchParams.set("status", "eq.approved");
    query.searchParams.set(
      "select",
      "id,address,price,bedrooms,bathrooms,square_feet,property_sponsors(sponsors(name,tier))",
    );
    const response = await fetch(query, { headers: supabaseHeaders(key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Listings unavailable" }, { status: 502 });
    type PublicRow = {
      id: string;
      address: string;
      price: number;
      bedrooms: number;
      bathrooms: number;
      square_feet: number;
      property_sponsors?: { sponsors: { name: string; tier: string } | null }[];
    };
    const rows = (await response.json()) as PublicRow[];
    return NextResponse.json(rows.map(({ property_sponsors, ...property }) => ({
      ...property,
      sponsors: (property_sponsors ?? [])
        .map((link) => link.sponsors)
        .filter((sponsor): sponsor is { name: string; tier: string } => sponsor !== null),
    })));
  } catch {
    return NextResponse.json({ error: "Listings unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid property", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { url, key } = publicSupabaseConfig();
    const userResponse = await fetch(new URL("/auth/v1/user", url), {
      headers: supabaseHeaders(key, token),
      cache: "no-store",
    });
    if (!userResponse.ok) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    const user = (await userResponse.json()) as { id?: string };
    if (!user.id) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const insertUrl = new URL("/rest/v1/properties", url);
    const response = await fetch(insertUrl, {
      method: "POST",
      headers: { ...supabaseHeaders(key, token), Prefer: "return=representation" },
      body: JSON.stringify({ ...parsed.data, owner_id: user.id, status: "draft" }),
      cache: "no-store",
    });
    if (response.status === 403 || response.status === 401) {
      return NextResponse.json({ error: "Property owner access required" }, { status: 403 });
    }
    if (!response.ok) return NextResponse.json({ error: "Unable to save property" }, { status: 502 });
    const [property] = (await response.json()) as unknown[];
    return NextResponse.json(property, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Property service unavailable" }, { status: 503 });
  }
}
