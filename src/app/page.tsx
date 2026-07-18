export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f3ec] px-5 py-12 text-[#17211d] sm:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-[-7rem] h-72 w-72 rounded-full bg-[#ef5b2a]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-36 -right-20 h-80 w-80 rounded-full bg-[#1f7a5a]/12 blur-3xl"
      />

      <section className="relative w-full max-w-3xl rounded-[2rem] border border-black/8 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(23,33,29,0.10)] backdrop-blur sm:px-12 sm:py-14">
        <p className="mb-8 inline-flex rounded-full border border-[#1f7a5a]/20 bg-[#1f7a5a]/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#176146]">
          Build Week foundation
        </p>

        <h1 className="text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
          BurgerMapper
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#47534e] sm:text-xl sm:leading-9">
          BurgerMapper turns official Berlin letters into clear next steps.
        </p>

        <div className="mt-10 border-t border-black/8 pt-6">
          <p className="text-sm leading-6 text-[#66716c]">
            The interactive workflow will be added in later phases.
          </p>
        </div>
      </section>
    </main>
  );
}
