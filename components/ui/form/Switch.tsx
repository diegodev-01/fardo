interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="absolute inset-0 rounded-full transition-colors duration-200 ease-in-out bg-gray-600 peer-checked:bg-primary dark:peer-checked:bg-primary" />
      <span className="relative left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
    </label>
  );
};
