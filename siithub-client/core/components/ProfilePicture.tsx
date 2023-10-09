import Image from "next/image";
import { type FC } from "react";
import { type User } from "../../features/users/user.model";
import { imagesPath } from "../../features/users/profile/uploadPicture";

const colors = ["#E02424", "#E3A008", "#0E9F6E", "#1C64F2", "#5850EC", "#7E3AF2", "#D61F69"] as const;
const white = "#E5E7EB" as const;

function hashCode(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash &= hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getColorAndPixels(username: string) {
  const color = colors[username.charCodeAt(0) % colors.length];
  const n = (username.charCodeAt(username.length - 1) % 4) + 6;
  const hash = hashCode(username);
  let c = 0;
  const pixels = Array.from({ length: 15 }, (_, i) => i < n).sort(() => 2 * (hash << c++) - 1);
  return { color, pixels };
}

const mirroredPixels = [
  // x, y, i
  [0, 0, 0],
  [1, 0, 1],
  [2, 0, 2],
  [3, 0, 1],
  [4, 0, 0],
  [0, 1, 3],
  [1, 1, 4],
  [2, 1, 5],
  [3, 1, 4],
  [4, 1, 3],
  [0, 2, 6],
  [1, 2, 7],
  [2, 2, 8],
  [3, 2, 7],
  [4, 2, 6],
  [0, 3, 9],
  [1, 3, 10],
  [2, 3, 11],
  [3, 3, 10],
  [4, 3, 9],
  [0, 4, 12],
  [1, 4, 13],
  [2, 4, 14],
  [3, 4, 13],
  [4, 4, 12],
] as const;

type ProfilePictureSVGProps = {
  username: string;
  size?: number;
};

export const ProfilePictureSVG: FC<ProfilePictureSVGProps> = ({ username, size = 50 }) => {
  const { color, pixels } = getColorAndPixels(username);
  const Pixel: FC<{ x: number; y: number; i: number }> = ({ x, y, i }) => (
    <rect y={y} x={x} width={1} height={1} fill={pixels[i] ? color : white} />
  );
  return (
    <svg viewBox="0 0 5 5" fill="none" width={size} height={size}>
      <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x={0} y={0} width={5} height={5}>
        <rect width={5} height={5} rx={3} fill="white" />
      </mask>
      <g mask="url(#mask0)">
        {mirroredPixels.map(([x, y, i], key) => (
          <Pixel x={x} y={y} i={i} key={key} />
        ))}
      </g>
    </svg>
  );
};

export function drawProfilePicture(canvas: HTMLCanvasElement, username: string, size = 300) {
  canvas.width = size;
  canvas.height = size;
  const margin = size / 12;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, size, size);
  const { color, pixels } = getColorAndPixels(username);
  const pixelSize = size / 6;
  ctx.fillStyle = color;
  mirroredPixels.forEach(([x, y, i]) => {
    if (pixels[i]) ctx.fillRect(margin + x * pixelSize, margin + y * pixelSize, pixelSize, pixelSize);
  });
}

type CirclularImageProps = {
  url: string;
  size?: number;
};

export const CirclularImage: FC<CirclularImageProps> = ({ url, size = 50 }) => (
  <Image
    src={url}
    alt="User"
    width={size}
    height={size}
    style={{ width: size, height: size }}
    className="rounded-full object-cover"
  />
);

type ProfilePictureProps = {
  user: Pick<User, "pictures" | "username">;
  size?: number;
};

export const ProfilePicture: FC<ProfilePictureProps> = ({ user, size = 50 }) =>
  user.pictures?.length ? (
    <CirclularImage url={imagesPath + user.pictures.at(-1)} size={size} />
  ) : (
    <ProfilePictureSVG username={user.username} size={size} />
  );
