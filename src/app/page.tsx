export default function Home() {
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
      </div>
    </main>
  );
}