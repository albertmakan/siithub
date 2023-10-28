import { type FC } from "react";

type ButtonProps = {
  type?: "submit" | "button";
  onClick?: () => any;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export const Button: FC<ButtonProps> = ({
  type = "submit",
  onClick = () => {},
  children,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 ${
        className.includes("text-") ? "" : "text-lg"
      } font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
};
