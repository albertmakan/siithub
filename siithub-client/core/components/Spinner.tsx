import { type FC } from "react";

type SpinnerProps = {
  size?: number;
};

export const Spinner: FC<SpinnerProps> = ({ size = 100 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full border-spacing-40 border-8 border-dashed border-blue-500 animate-spin m-4`}
    />
  );
};
