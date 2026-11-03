import type { SearchFiltersProps } from "../types";

export default function SearchFilters({
  propertyTypes,
  maxPriceOptions,
  selectedPropertyType,
  selectedMaxPrice,
  action = "/",
}: SearchFiltersProps) {
  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label="Filter properties"
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-3 md:items-end"
    >
      <div>
        <label htmlFor="property-type" className="block font-medium">
          Property type
        </label>
        <select
          id="property-type"
          name="propertyType"
          defaultValue={selectedPropertyType ?? ""}
          className="mt-2 w-full rounded-md border border-slate-400 bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <option value="">All property types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="max-price" className="block font-medium">
          Maximum price
        </label>
        <select
          id="max-price"
          name="maxPrice"
          defaultValue={selectedMaxPrice?.toString() ?? ""}
          className="mt-2 w-full rounded-md border border-slate-400 bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <option value="">Any price</option>
          {maxPriceOptions.map((price) => (
            <option key={price} value={price}>
              {priceFormatter.format(price)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Search listings
      </button>
    </form>
  );
}