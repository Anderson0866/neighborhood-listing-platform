import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publicSupabaseConfig, supabaseHeaders } from "../../../lib/supabaseServer";

const inquirySchema = z.strictObject({
  property_id: z.uuid(),
  inquirer_email: z.email(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inquiry", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const { url, key } = publicSupabaseConfig();
    const response = await fetch(new URL("/rest/v1/inquiries", url), {
      method: "POST",
      headers: { ...supabaseHeaders(key), Prefer: "return=minimal" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Unable to submit inquiry" }, { status: 400 });
    return NextResponse.json({ submitted: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Inquiry service unavailable" }, { status: 503 });
  }
}
