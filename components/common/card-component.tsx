import React from "react";

interface CardComponentProps {
  children?: React.ReactNode;
  selectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CardComponent = ({
  children,
  selectable = true,
  isSelected = false,
  onClick,
}: CardComponentProps) => {
  const baseClasses =
    "relative rounded-md p-4 transition-all cursor-pointer border hover:bg-primary-light/10 transition-colors duration-200 ";

  const stateClasses = isSelected
    ? "border-primary bg-primary-light/20 shadow-sm"
    : "border-primary-light/20 bg-transparent hover:border-primary/70";

  const hoverClasses =
    selectable && !isSelected ? "hover:bg-primary-light/10" : "";

  return (
    <article
      onClick={onClick}
      className={`${baseClasses} ${stateClasses} ${hoverClasses}`}
    >
      {children}
    </article>
  );
};
