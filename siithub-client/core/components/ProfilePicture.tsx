import { type FC } from "react";

type ProfilePictureProps = {
  username: string;
  size?: number;
};

const colors = ["#E02424", "#E3A008", "#0E9F6E", "#1C64F2", "#5850EC", "#7E3AF2", "#D61F69"] as const;
const white = "#E5E7EB" as const;

export const ProfilePicture: FC<ProfilePictureProps> = ({ username, size = 50 }) => {
  const color = colors[username.charCodeAt(0) % colors.length];
  const n = (username.charCodeAt(username.length - 1) % 4) + 6;
  const hash = hashCode(username);
  let c = 0;
  const pixels = Array.from({ length: 15 }, (_, i) => i < n).sort(() => 2 * (hash << c++) - 1);
  const Pixel: FC<{ x: number; y: number; i: number }> = ({ x, y, i }) => (
    <rect y={y} x={x} width={1} height={1} fill={pixels[i] ? color : white} />
  );
  return (
    <svg viewBox="0 0 5 5" fill="none" width={size} height={size}>
      <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x={0} y={0} width={5} height={5}>
        <rect width={5} height={5} rx={3} fill="white" />
      </mask>
      <g mask="url(#mask0)">
        <Pixel y={0} x={0} i={0} />
        <Pixel y={0} x={1} i={1} />
        <Pixel y={0} x={2} i={2} />
        <Pixel y={0} x={3} i={1} />
        <Pixel y={0} x={4} i={0} />
        <Pixel y={1} x={0} i={3} />
        <Pixel y={1} x={1} i={4} />
        <Pixel y={1} x={2} i={5} />
        <Pixel y={1} x={3} i={4} />
        <Pixel y={1} x={4} i={3} />
        <Pixel y={2} x={0} i={6} />
        <Pixel y={2} x={1} i={7} />
        <Pixel y={2} x={2} i={8} />
        <Pixel y={2} x={3} i={7} />
        <Pixel y={2} x={4} i={6} />
        <Pixel y={3} x={0} i={9} />
        <Pixel y={3} x={1} i={10} />
        <Pixel y={3} x={2} i={11} />
        <Pixel y={3} x={3} i={10} />
        <Pixel y={3} x={4} i={9} />
        <Pixel y={4} x={0} i={12} />
        <Pixel y={4} x={1} i={13} />
        <Pixel y={4} x={2} i={14} />
        <Pixel y={4} x={3} i={13} />
        <Pixel y={4} x={4} i={12} />
      </g>
    </svg>
  );
};

function hashCode(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    let character = name.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
