interface LogoProps {
  compact?: boolean;
  inverse?: boolean;
}

export function Logo({ compact = false, inverse = false }: LogoProps) {
  return (
    <span className={`brand ${inverse ? "brand--inverse" : ""}`}>
      <svg
        className="brand__mark"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <rect width="48" height="48" rx="13" className="brand__mark-bg" />
        <path d="M13 12v24M35 12v24" className="brand__warp" />
        <path
          d="M14 18c5 0 7 13 13 13 4 0 5-4 7-7M14 30c5 0 7-13 13-13 4 0 5 4 7 7"
          className="brand__weft"
        />
      </svg>
      {!compact && (
        <span className="brand__word">
          Access<span>Loom</span>
        </span>
      )}
    </span>
  );
}
