interface ButtonComponentProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  style?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "transparent"
    | "link";
}

export const ButtonComponent = ({
  label,
  children,
  onClick,
  type = "button",
  style = "primary",
}: ButtonComponentProps) => {
  return (
    <div className="flex items-center justify-center">
      {label && (
        <button
          className={`flex items-center bg-${style} ${style === "secondary" ? "border border-primary bg-transparent" : ""} gap-2 text-${style}-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer`}
          onClick={onClick}
          type={type}
        >
          {label}
        </button>
      )}
      {children && (
        <button
          className={`flex items-center gap-2 bg-${style} ${style === "secondary" ? "border border-primary bg-transparent" : ""} text-${style}-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer`}
          onClick={onClick}
          type={type}
        >
          {children}
        </button>
      )}
    </div>
  );
};
