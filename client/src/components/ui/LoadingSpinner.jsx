export default function LoadingSpinner({ label = "Loading...", size = "md" }) {
  const dims = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-9 w-9 border-[3px]" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-ink-muted">
      <div className={`${dims[size]} animate-spin rounded-full border-primary border-t-transparent`} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
