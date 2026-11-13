"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string | null;
  address?: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  price: number;
};

export default function LiveListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/listings", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Request failed");

        const result: { listings: Listing[] } = await response.json();
        setListings(result.listings);
        setState("ready");
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <section className="mt-14" aria-labelledby="live-listings-heading">
      <h2 id="live-listings-heading" className="text-2xl font-semibold">
        Database listings
      </h2>

      {state === "loading" && <p role="status">Loading listings...</p>}
      {state === "error" && (
        <p role="alert">Listings could not be loaded. Please try again.</p>
      )}
      {state === "ready" && listings.length === 0 && (
        <p role="status">No approved listings are available yet.</p>
      )}

      {state === "ready" && listings.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <li key={listing.id} className="rounded-xl border bg-white p-5">
              <h3 className="text-lg font-semibold">
                {listing.title ?? "Property listing"}
              </h3>
              <p>
                {listing.street_address && listing.city
                  ? `${listing.street_address}, ${listing.city}, ${listing.state}`
                  : listing.address ?? "Address details coming soon"}
              </p>
              <p>${Number(listing.price).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}