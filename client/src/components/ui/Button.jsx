const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-primary-light text-primary-dark hover:bg-primary/20",
  outline: "border border-line bg-surface text-ink hover:bg-bg",
  ghost: "text-ink-muted hover:bg-bg",
  danger: "bg-critical text-white hover:bg-red-700",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
    </button>
  );
}
