export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl animate-pulse text-center">
        <div className="mb-8 border-b border-zinc-800 pb-6 sm:mb-10 sm:pb-8">
          <div className="mx-auto h-12 w-28 rounded bg-zinc-800 sm:h-14 sm:w-32" />

          <div className="mx-auto mt-3 h-4 w-52 rounded bg-zinc-800" />
        </div>

        <div className="h-12 w-full rounded-lg bg-zinc-800" />
      </div>
    </main>
  );
}
