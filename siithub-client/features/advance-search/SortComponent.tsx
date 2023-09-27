import { useRouter } from "next/router";
import { type FC } from "react";
import Select from "react-select";

type SortComponentProps = {
  options: { label: string; value: { [field: string]: 1 | -1 } }[];
};
export const SortComponent: FC<SortComponentProps> = ({ options }) => {
  const router = useRouter();

  const searchItems = (sortOptions?: { [field: string]: 1 | -1 }) => {
    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        sort:
          sortOptions &&
          Object.entries(sortOptions)
            .map(([f, d]) => (d < 0 ? "-" : "") + f)
            .join(","),
      },
    };
    router.push(url, undefined, { shallow: true });
  };

  return (
    <div className="flex space-x-2 items-center">
      <div className="min-w-[256px]">
        <Select defaultValue={options[0]} options={options} onChange={(val) => searchItems(val?.value)} />
      </div>
    </div>
  );
};
