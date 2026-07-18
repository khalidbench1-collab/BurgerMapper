import type { WorkflowStatus } from "@/domain/case";

const steps = [
  { number: 1, label: "Document" },
  { number: 2, label: "Language" },
  { number: 3, label: "Your route" },
];

function getCurrentStep(status: WorkflowStatus): number {
  if (status === "analysis-complete") return 3;
  if (status === "ready" || status === "mock-analyzing") return 2;
  return 1;
}

export function IntakeProgress({ status }: { status: WorkflowStatus }) {
  const currentStep = getCurrentStep(status);

  return (
    <nav aria-label="Case progress" className="print:hidden">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const state =
            step.number < currentStep
              ? "complete"
              : step.number === currentStep
                ? "current"
                : "upcoming";

          return (
            <li
              key={step.number}
              aria-current={state === "current" ? "step" : undefined}
              className="min-w-0"
            >
              <div
                className={`mb-2 h-1.5 rounded-full ${
                  state === "complete"
                    ? "bg-[#237b59]"
                    : state === "current"
                      ? "bg-[#ef6a38]"
                      : "bg-[#dfe3df]"
                }`}
              />
              <p className="truncate text-xs font-semibold text-[#5d6862]">
                <span className="sr-only">Step {step.number}: </span>
                {step.label}
                {state === "complete" ? <span className="sr-only"> complete</span> : null}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
