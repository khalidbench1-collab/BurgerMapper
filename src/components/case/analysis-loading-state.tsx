export function AnalysisLoadingState() {
  return (
    <section aria-labelledby="analysis-loading-heading" className="rounded-2xl border border-[#d4d9d5] bg-white p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#c8d5ce] border-t-[#237b59] motion-reduce:animate-none" />
        <div>
          <h2 id="analysis-loading-heading" className="text-lg font-semibold text-[#1d2b24]">
            Building your mock route
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#68736d]">
            The BurgerMapper server is validating the input in memory and applying the fictional scenario. Nothing is sent to an AI provider.
          </p>
        </div>
      </div>
    </section>
  );
}
