import React, { forwardRef } from "react";

interface InputComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const InputComponent = forwardRef<HTMLInputElement, InputComponentProps>(
  ({ label, error, name, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={name}
            className="block text-xs font-medium text-text/70 mb-1"
          >
            {label}
          </label>
        )}
        <input
          type={props.type || "text"}
          ref={ref}
          id={name}
          name={name}
          className={`w-full text-sm bg-background border rounded-md ${
            props.type === "color" ? "h-10 p-1 cursor-pointer" : "p-2"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-border focus:outline-none focus:ring-1 focus:ring-primary"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
      </div>
    );
  },
);

InputComponent.displayName = "InputComponent";
