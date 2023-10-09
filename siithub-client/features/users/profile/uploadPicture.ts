import axios from "axios";
import { drawProfilePicture } from "../../../core/components/ProfilePicture";

export const imagesPath = "/api/users/profile-image/";
const headers = { "Content-Type": "multipart/form-data" };

export function uploadDefaultImage(canvas: HTMLCanvasElement, username: string, token: string) {
  drawProfilePicture(canvas, username);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const fd = new FormData();
    fd.append("image", blob, username);
    axios.create({ headers: { Authorization: "Bearer " + token } }).post(imagesPath, fd, { headers });
  });
}

export function uploadImage(file: File, username: string) {
  if (!file) return;
  const fd = new FormData();
  fd.append("image", file, username);
  axios.post(imagesPath, fd, { headers });
}
