import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Listings are temporarily unavailable." },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, title, property_type, description, street_address, city, state, zip_code, price, bedrooms, bathrooms, square_feet, amenities, image_path, image_alt_text"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Listings query failed:", error.message);
    return NextResponse.json(
      { error: "Listings are temporarily unavailable." },
      { status: 500 }
    );
  }

  return NextResponse.json({ listings: data });
}

const NewListing = z.strictObject({
  title: z.string().min(3),
  property_type: z.enum(["Apartment", "Condo", "House"]),
  description: z.string().min(10),
  street_address: z.string().min(3),
  city: z.string().min(2),
  state: z.literal("CA"),
  zip_code: z.string().regex(/^[0-9]{5}$/),
  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative().multipleOf(0.5),
  square_feet: z.number().int().positive(),
  amenities: z.array(z.enum([
    "parking", "laundry", "balcony",
    "air_conditioning", "pool", "gym",
  ])),
  image_path: z.enum([
    "/properties/apartment.jpg",
    "/properties/condo.jpg",
    "/properties/house.jpg",
  ]),
  image_alt_text: z.string().min(10),
});

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Listings are temporarily unavailable." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = NewListing.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the listing fields and try again." },
      { status: 400 }
    );
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const listing = parsed.data;
  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...listing,
      address: `${listing.street_address}, ${listing.city}, ${listing.state} ${listing.zip_code}`,
      owner_id: user.id,
      status: "draft",
    })
    .select("id, status")
    .single();

  if (error) {
    console.error("Create listing failed:", error.message);
    return NextResponse.json(
      { error: "Listing could not be saved." },
      { status: 403 }
    );
  }

  return NextResponse.json({ listing: data }, { status: 201 });
}

const ListingChanges = z.strictObject({
  id: z.uuid(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().nonnegative().optional(),
}).refine(
  (value) =>
    value.title !== undefined ||
    value.description !== undefined ||
    value.price !== undefined
);

export async function PATCH(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Listings are temporarily unavailable." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = ListingChanges.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the listing changes and try again." },
      { status: 400 }
    );
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id, ...changes } = parsed.data;
  const { data, error } = await supabase
    .from("properties")
    .update(changes)
    .eq("id", id)
    .eq("owner_id", user.id)
    .in("status", ["draft", "rejected"])
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("Edit listing failed:", error.message);
    return NextResponse.json(
      { error: "Listing could not be updated." },
      { status: 403 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Editable listing not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ listing: data });
}