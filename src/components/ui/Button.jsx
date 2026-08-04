export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button' }) {
  const baseClasses = "px-6 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#2D5BE3] text-white hover:bg-[#244bc4] focus:ring-[#2D5BE3]",
    secondary: "bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F1F5F9]",
    danger: "bg-[#DC2626] text-white hover:bg-[#b91c1c] focus:ring-[#DC2626]"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}