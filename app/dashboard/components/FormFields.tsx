"use client";

import React from "react";
import { DashboardSelect } from "./DashboardDropdown";

type FormFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: "text" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
};

export default function FormField({
  label,
  name,
  type = "text",
  required = false,
  helpText,
  ...props
}: FormFieldProps) {
  const commonClasses =
    "w-full px-3 py-2 theme-input focus:ring-0 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <DashboardSelect
            value={String(props.value ?? "")}
            disabled={props.disabled}
            onValueChange={(value) =>
              props.onChange({
                target: { name, value },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            options={props.options ?? []}
          />
        );
      case "textarea":
        return (
          <textarea
            name={name}
            rows={3}
            className={commonClasses}
            {...props}
          />
        );
      default:
        return <input name={name} type="text" className={commonClasses} {...props} />;
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium theme-text mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {helpText && <span className="text-xs theme-text-secondary ml-2">{helpText}</span>}
      </label>
      {renderInput()}
    </div>
  );
}
