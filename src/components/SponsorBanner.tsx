import type { SponsorBannerProps } from "../types";

export default function SponsorBanner({ sponsor }: SponsorBannerProps) {
  return (
    <aside className="rounded-xl border border-blue-200 bg-blue-50 p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
        Sponsored
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        {sponsor.businessName}
      </h2>

      <p className="mt-3 text-slate-700">{sponsor.message}</p>

      <a
        href={sponsor.destinationLink}
        className="mt-4 inline-block text-blue-700 underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Visit {sponsor.businessName}
      </a>
    </aside>
  );
}