import { useRouter } from "next/router";
import { PulseInsights } from "../../../../features/insights/pulse-insights";

const Pulse = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  return (
    <>
      <div className="flex items-center w-full border-b pb-3">
        <div className="text-2xl">
          Pulse insights of{" "}
          <b>
            {username}/{repository}
          </b>
        </div>
      </div>
      <PulseInsights />
    </>
  );
};

export default Pulse;
