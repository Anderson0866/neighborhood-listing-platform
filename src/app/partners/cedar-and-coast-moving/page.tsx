import Link from "next/link";
export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Cedar &amp; Coast Moving</h1>
        <p className="mt-4 text-lg">
          Move planning and packing support for your next home.
        </p>
        <Link href="/" className="mt-8 inline-block text-blue-700 underline">
          Back to property listings
        </Link>
      </div>
    </main>
  );
}