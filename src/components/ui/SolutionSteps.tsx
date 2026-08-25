"use client";

import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Add",
    description:
      "Add products manually, scan them or import inventory data into ShelfLife.",
  },
  {
    number: "02",
    title: "Track",
    description:
      "Keep quantities, batches and expiry dates organized in one place.",
  },
  {
    number: "03",
    title: "Alert",
    description:
      "Know what needs attention before products become waste.",
  },
  {
    number: "04",
    title: "Act",
    description:
      "Use insights and recommendations to make smarter inventory decisions.",
  },
];

export default function SolutionSteps() {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = steps[activeStep];

  return (
    <div className="mt-12">
      {/* Step navigation */}
      <div className="grid grid-cols-4 border-b border-white/10">
        {steps.map((step, index) => {
          const isActive = index === activeStep;

          return (
            <button
              key={step.number}
              onClick={() => setActiveStep(index)}
              className="group relative px-3 py-5 text-left md:px-5"
            >
              <span
                className={`text-xs transition-colors duration-300 ${
                  isActive
                    ? "text-[var(--shelf-light)]"
                    : "text-white/30 group-hover:text-white/60"
                }`}
              >
                {step.number}
              </span>

              <p
                className={`mt-2 text-sm font-medium transition-colors duration-300 md:text-base ${
                  isActive
                    ? "text-white"
                    : "text-white/40 group-hover:text-white/70"
                }`}
              >
                {step.title}
              </p>

              {/* Active indicator */}
              <span
                className={`absolute bottom-0 left-0 h-px bg-[var(--shelf-light)] transition-all duration-300 ${
                  isActive ? "w-full" : "w-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Active step */}
      <div className="relative mt-10 min-h-32">
        <div
          key={activeStep}
          className="animate-[fadeIn_400ms_ease-out]"
        >
          <p className="text-sm uppercase tracking-[0.15em] text-[var(--shelf-light)]">
            Step {currentStep.number}
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-white">
            {currentStep.title}
          </h3>

          <p className="mt-3 max-w-xl leading-7 text-white/60">
            {currentStep.description}
          </p>
        </div>
      </div>
    </div>
  );
}