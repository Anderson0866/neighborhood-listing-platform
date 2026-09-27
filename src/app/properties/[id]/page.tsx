import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { properties } from "../../../data/properties";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = properties.find((item) => item.id === id);

  if (!property) notFound();

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-blue-700 underline">
          Back to property listings
        </Link>

        <h1 className="mt-8 text-3xl font-bold">{property.title}</h1>
        <p className="mt-2 text-slate-600">{property.address}</p>

        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={property.imagePath}
            alt={property.imageAltText}
            fill
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>

        <p className="mt-6 text-2xl font-semibold text-blue-700">{price}</p>
        <p className="mt-2">
          {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
        </p>
      </article>
    </main>
  );
}