import { type FC } from "react";

type LabelPreviewProps = {
  name: string;
  color: string;
};

export const LabelPreview: FC<LabelPreviewProps> = ({ name, color }) => {
  return (
    <span
      className={"text-sm font-semibold leading-6 rounded-full px-2 mx-1 border-2"}
      style={{ backgroundColor: color + "20", color, borderColor: color }}
    >
      {name || "Label preview"}
    </span>
  );
};
