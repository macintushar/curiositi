export function Folder({
  className,
  strokeClassName,
}: {
  className?: string;
  strokeClassName?: string;
}) {
  return (
    <svg
      width="187"
      height="131"
      viewBox="0 0 187 131"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        id="Vector 4"
        d="M1 9V122C1 126.418 4.58172 130 9 130H178C182.418 130 186 126.418 186 122V28.5724C186 24.1541 182.418 20.5724 178 20.5724H70.6606C68.4112 20.5724 66.2656 19.6254 64.7498 17.9633L51.6581 3.60907C50.1423 1.94705 47.9967 1 45.7473 1H9C4.58172 1 1 4.58173 1 9Z"
        fill="#E7E5E4"
        stroke="#D6D3D1"
        className={strokeClassName}
      />
    </svg>
  );
}

export function EmptyFolder({
  className,
  strokeClassName,
}: {
  className?: string;
  strokeClassName?: string;
}) {
  return (
    <svg
      width="187"
      height="131"
      viewBox="0 0 187 131"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 9V122C1 126.418 4.58172 130 9 130H178C182.418 130 186 126.418 186 122V28.5724C186 24.1541 182.418 20.5724 178 20.5724H70.6606C68.4112 20.5724 66.2656 19.6254 64.7498 17.9633L51.6581 3.60907C50.1423 1.94705 47.9967 1 45.7473 1H9C4.58172 1 1 4.58173 1 9Z"
        fill="#E7E5E4"
        fillOpacity="0.5"
        stroke="#D6D3D1"
        strokeDasharray="2 2"
        className={strokeClassName}
      />
      <path
        d="M93.4004 70.3999L93.4004 86.3999"
        stroke="#A8A29E"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M85.4004 78.401L101.4 78.401"
        stroke="#A8A29E"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
