export function AppFooter() {
  return (
    <footer className="border-t border-[#d9ddd7] bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-5 py-5 text-xs leading-5 text-[#68736d] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="font-semibold text-[#4c5952]">BurgerMapper is an independent guide, not an official government service.</span>{" "}
          It provides legal information, not legal advice.
        </p>
        <p>Case content is processed in memory and never logged.</p>
      </div>
    </footer>
  );
}
