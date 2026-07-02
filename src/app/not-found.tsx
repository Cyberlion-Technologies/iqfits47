import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="font-display text-4xl uppercase tracking-tight text-ink">
        404 — Page Not Found
      </h1>
      <p className="mt-2 text-sm text-ink/50">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-white hover:bg-ink/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
