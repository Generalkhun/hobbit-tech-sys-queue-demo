export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
      <legend className="mb-2">{label}</legend>
      <div className="flex flex-wrap gap-5 font-normal">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={label}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-sys-600"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
