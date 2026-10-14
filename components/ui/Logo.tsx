import { SITE } from "@/config/site";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label={SITE.name}>
      <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="jg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00D5FF" />
            <stop offset="1" stopColor="#008CFF" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="17" fill="none" stroke="url(#jg)" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="9" fill="none" stroke="url(#jg)" strokeWidth="1.5" opacity=".6" />
        <path d="M17 14.5v11l9-5.5z" fill="url(#jg)" />
      </svg>
      {!compact && (
        <span className="brand__text">
          JARVIS <b>TV</b>
        </span>
      )}
    </span>
  );
}
