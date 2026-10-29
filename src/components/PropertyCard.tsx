import Image from "next/image";
import type { PropertyCardProps } from "../types";

export default function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <Image
          src={property.imagePath}
          alt={property.imageAltText}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-slate-900">
          {property.title}
        </h3>
        <p className="mt-2 text-slate-600">{property.address}</p>
        <p className="mt-3 font-semibold text-blue-700">{formattedPrice}</p>

        <ul className="mt-3 flex gap-4 text-sm text-slate-700">
          <li>{property.bedrooms} bedrooms</li>
          <li>{property.bathrooms} bathrooms</li>
        </ul>

        <a
          href={property.destinationLink}
          className="mt-4 inline-block text-blue-700 underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          View details for {property.title}
        </a>
      </div>
    </article>
  );
}