"use client";

import React from "react";
import { motion } from "framer-motion";
import { FormStep as FormStepType, FormData } from "@/lib/types";
import { evaluateCondition } from "@/lib/form-config";

interface FormStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | number | boolean | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  stepIndex: number;
  totalSteps: number;
}

export default function FormStepComponent({
  step,
  formData,
  onFieldChange,
  onNext,
  onPrev,
  isFirst,
  isLast,
  stepIndex,
  totalSteps,
}: FormStepProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const isFieldVisible = (field: { visibleWhen?: { field: string; operator: string; value: string | number } }) => {
    if (!field.visibleWhen) return true;
    return evaluateCondition(field.visibleWhen, formData);
  };

  const canProceed = () => {
    return step.fields
      .filter((f) => f.required && isFieldVisible(f))
      .every((f) => {
        const val = formData[f.id];
        return val !== undefined && val !== "" && val !== null;
      });
  };

  const renderField = (field: FormStepType["fields"][0]) => {
    if (!isFieldVisible(field)) return null;

    const value = formData[field.id];

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type={field.type}
            className="form-input"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) =>
              onFieldChange(
                field.id,
                field.type === "number" ? Number(e.target.value) : e.target.value
              )
            }
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case "textarea":
        return (
          <textarea
            className="form-textarea"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              className="form-select"
              value={String(value ?? "")}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
            >
              <option value="">{field.placeholder || "Select..."}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <div
                key={opt.value}
                onClick={() => onFieldChange(field.id, opt.value)}
                role="radio"
                aria-checked={value === opt.value}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onFieldChange(field.id, opt.value); }}
                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all duration-300 select-none ${
                  value === opt.value
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    value === opt.value ? "border-stone-900" : "border-stone-300"
                  }`}
                >
                  {value === opt.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-stone-900"
                    />
                  )}
                </div>
                <span className="text-sm font-light">{opt.label}</span>
              </div>
            ))}
          </div>
        );

      case "checkbox": {
        const checkedValues = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const isChecked = checkedValues.includes(opt.value);
              const toggleCheckbox = () => {
                const newValues = isChecked
                  ? checkedValues.filter((v) => v !== opt.value)
                  : [...checkedValues, opt.value];
                onFieldChange(field.id, newValues);
              };
              return (
                <div
                  key={opt.value}
                  onClick={toggleCheckbox}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleCheckbox(); }}
                  className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all duration-300 select-none ${
                    isChecked
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-[2px] border-2 flex items-center justify-center transition-all duration-300 ${
                      isChecked ? "border-stone-900 bg-stone-900" : "border-stone-300"
                    }`}
                  >
                    {isChecked && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    )}
                  </div>
                  <span className="text-sm font-light">{opt.label}</span>
                </div>
              );
            })}
          </div>
        );
      }

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              className="w-full accent-stone-900"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={Number(value ?? field.defaultValue ?? field.min ?? 0)}
              onChange={(e) => onFieldChange(field.id, Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>{field.min ?? 0}</span>
              <span className="text-stone-900 font-medium">
                {value ?? field.defaultValue ?? field.min ?? 0}
              </span>
              <span>{field.max ?? 100}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col"
    >
      {/* Step header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <div className="flex-1 h-[1px] bg-stone-200" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight mb-2">
          {step.title}
        </h2>
        <p className="text-sm text-stone-500 font-light">{step.description}</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="h-[2px] bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-stone-900"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>

      {/* Fields */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {step.fields.map((field) => (
          <motion.div key={field.id} variants={itemVariants}>
            {isFieldVisible(field) && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Navigation buttons */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100"
      >
        {!isFirst ? (
          <button onClick={onPrev} className="btn-outline">
            Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          disabled={!canProceed()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast ? "Submit & Get Guidance" : "Continue"}
        </button>
      </motion.div>
    </motion.div>
  );
}
