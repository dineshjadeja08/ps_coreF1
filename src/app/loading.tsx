export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8" role="status" aria-label="Loading page">
      <div className="h-7 w-52 rounded-lg bg-primary-soft" />
      <div className="mt-5 h-48 rounded-xl bg-muted sm:h-64" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 rounded-xl border border-border bg-white" />)}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
