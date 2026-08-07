export default function Input({ label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#475569] rounded-lg bg-white dark:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] transition-colors"
      />
    </div>
  );
}