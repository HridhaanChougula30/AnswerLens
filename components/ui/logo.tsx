export function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className="inline-block"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* "A" with gradient */}
      <g>
        <text
          x="4"
          y="24"
          fontSize="24"
          fontWeight="bold"
          fill="#3B82F6"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-1"
        >
          A
        </text>
      </g>
      {/* "L" overlapping */}
      <g>
        <text
          x="12"
          y="24"
          fontSize="24"
          fontWeight="bold"
          fill="#1E40AF"
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity="0.85"
        >
          L
        </text>
      </g>
    </svg>
  );
}
