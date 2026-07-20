import type { WorkflowStatus } from "@/domain/case";

const steps = [
  { id: "understanding", label: "Understanding your goal" },
  { id: "clarification", label: "Gathering context" },
  { id: "route", label: "Route ready" },
];

function getCurrentStep(status: WorkflowStatus): number {
  if (status === "analysis-complete") return 2;
  if (status === "needs-clarification") return 1;
  return 0;
}

export function IntakeProgress({ status }: { status: WorkflowStatus }) {
  const currentStep = getCurrentStep(status);

  return (
    <nav aria-label="Case progress" className="print:hidden">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const state =
            index < currentStep
              ? "complete"
              : index === currentStep
                ? "current"
                : "upcoming";

          return (
            <li
              key={step.id}
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
