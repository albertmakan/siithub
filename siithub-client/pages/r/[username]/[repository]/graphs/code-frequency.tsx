import { useRouter } from "next/router";
import { CodeFrequencyInsights } from "../../../../../features/insights/code-frequency-insights";

const CodeFrequency = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  return (
    <>
      <div className="flex items-center w-full border-b pb-3">
        <div className="text-2xl">
          Code frequency over the history of{" "}
          <b>
            {username}/{repository}
          </b>
        </div>
      </div>
      <CodeFrequencyInsights />
    </>
  );
};

export default CodeFrequency;
