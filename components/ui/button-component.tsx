interface ButtonComponentProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const ButtonComponent = ({
  label,
  children,
  onClick,
}: ButtonComponentProps) => {
  return (
    <>
      {label && (
        <button
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          onClick={onClick}
        >
          {label}
        </button>
      )}
      {children && (
        <button
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </>
  );
};
