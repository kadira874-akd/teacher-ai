/**
 * @typedef {import('@/types/jsdoc-typedefs').ButtonProps} ButtonProps
 */

/**
 * Button Component dengan dukungan variant, size, dan loading state
 * @param {ButtonProps} props
 * @returns {JSX.Element}
 */
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon
}) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none press-effect";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:from-[#4338CA] hover:to-[#6D28D9] focus:ring-[#4F46E5] shadow-md hover:shadow-lg",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400 shadow-sm hover:shadow-md",
    danger: "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:from-[#DC2626] hover:to-[#B91C1C] focus:ring-[#EF4444] shadow-md",
    success: "bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] focus:ring-[#10B981] shadow-md",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-400",
    outline: "bg-transparent text-[#4F46E5] border-2 border-[#4F46E5] hover:bg-[#EEF2FF] focus:ring-[#4F46E5]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
    xl: "px-8 py-4 text-lg rounded-2xl"
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && !loading && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}
