import SponsorBanner from "../components/SponsorBanner";
import SearchFilters from "../components/SearchFilters";
import PropertyCard from "../components/PropertyCard";
import { properties, propertyTypes, maxPriceOptions } from "../data/properties";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const selectedPropertyType =
    typeof params.propertyType === "string" &&
    propertyTypes.includes(params.propertyType)
      ? params.propertyType
      : undefined;
const requestedMaxPrice =
  typeof params.maxPrice === "string" ? Number(params.maxPrice) : NaN;
  const selectedMaxPrice = maxPriceOptions.includes(requestedMaxPrice)
  ? requestedMaxPrice
  : undefined;

const filteredProperties = properties.filter((property) => {
  const matchesType =
    selectedPropertyType === undefined ||
    property.propertyType === selectedPropertyType;

  const matchesPrice =
    selectedMaxPrice === undefined ||
    property.price <= selectedMaxPrice;

  return matchesType && matchesPrice;
});
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Welcome to your community hub
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Neighborhood Listing Platform
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Find useful local listings, discover organizations that support your
            neighborhood, and receive voice-guided help.
          </p>
        </header>

        <section className="mt-14" aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-center text-2xl font-semibold"
          >
            Explore the platform
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700">Listings</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Browse helpful listings for services, events, and opportunities
                available in your community.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700">
                Neighborhood Sponsors
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Learn about local businesses and organizations that support the
                neighborhood.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700">
                Voice Help
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Get voice-guided assistance when navigating the platform and
                finding information.
              </p>
            </article>
          </div>
        </section>
        <section className="mt-14" aria-labelledby="sample-listings-heading">
          <h2
            id="sample-listings-heading"
            className="text-center text-2xl font-semibold"
          >
            Explore properties
          </h2>
          <div className="mt-8">
  <SearchFilters
    propertyTypes={propertyTypes}
    maxPriceOptions={maxPriceOptions}
    selectedPropertyType={selectedPropertyType}
    selectedMaxPrice={selectedMaxPrice}
  />
</div>             

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.length === 0 && (
              <p className="col-span-full text-center text-slate-600">
                No properties match your search. Try different filters.
              </p>
             )}
             {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
             ))}
      </div>
      </section>
      <div className="mt-12">
  <SponsorBanner
    sponsor={{
      businessName: "Cedar & Coast Moving",
      message: "Planning a move? Get help with packing and move preparation.",
      destinationLink: "/partners/cedar-and-coast-moving",
    }}
  />
</div>
</div>
    </main>
  );
}