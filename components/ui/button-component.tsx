interface ButtonComponentProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  style?: "primary" | "secondary" | "danger" | "success" | "transparent" | "link";
}

// Literal class strings so Tailwind can see (and generate) every variant.
const VARIANTS: Record<NonNullable<ButtonComponentProps["style"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "border border-primary bg-transparent text-primary",
  danger: "bg-danger text-white",
  success: "bg-emerald-600 text-white",
  transparent: "bg-transparent text-text",
  link: "bg-transparent text-primary underline",
};

export const ButtonComponent = ({
  label,
  children,
  onClick,
  type = "button",
  disabled = false,
  style = "primary",
}: ButtonComponentProps) => {
  const content = children ?? label;
  if (!content) return null;
  return (
    <div className="flex items-center justify-center">
      <button
        className={`flex items-center gap-2 ${VARIANTS[style]} px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {content}
      </button>
    </div>
  );
};
