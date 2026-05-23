import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rubric-page flex min-h-screen items-center justify-center py-16">
      <div className="rubric-shell max-w-lg text-center">
        <div className="rubric-card p-10">
          <p className="rubric-kicker mb-4">404</p>
          <h1 className="rubric-title text-5xl">Page not found</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--rubric-slate)]">Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <Link href="/" className="rubric-button-primary mt-8">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
