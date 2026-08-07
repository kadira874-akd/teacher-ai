export default function Input({ label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-[#334155] mb-1.5">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent text-[#0F172A] placeholder-[#64748B]"
      />
    </div>
  );
}