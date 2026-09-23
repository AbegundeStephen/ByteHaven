import { useId } from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0B2447" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${gradientId})`} />
      <path
        d="M12 29 L20 10 L28 29"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="15.5"
        y1="22.5"
        x2="24.5"
        y2="22.5"
        stroke="#F0B429"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  tone?: "dark" | "light";
  textClassName?: string;
  className?: string;
}

/** Icon mark + "AkinStore" wordmark. `tone="light"` for dark/navy backgrounds. */
export function Logo({
  size = 32,
  tone = "dark",
  textClassName = "text-xl font-bold tracking-tight",
  className = "",
}: LogoProps) {
  const wordColor = tone === "light" ? "text-white" : "text-primary";
  const accentColor = tone === "light" ? "text-accent" : "text-secondary";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className={`${textClassName} ${wordColor}`}>
        Akin<span className={accentColor}>Store</span>
      </span>
    </span>
  );
}
