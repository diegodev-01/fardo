import React, { forwardRef } from "react";

interface InputComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputComponent = forwardRef<HTMLInputElement, InputComponentProps>(
  ({ label, error, name, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={name}
            className="text-sm font-medium text-text-color ml-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          className={`rounded-md border px-3 py-2 transition-colors focus:outline-none focus:ring-1 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-primary-light focus:border-primary focus:ring-primary"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 ml-1.5">{error}</span>}
      </div>
    );
  },
);

InputComponent.displayName = "InputComponent";
