import { useRouter } from "next/router";
import { ForksInsights } from "../../../../../features/insights/forks-insights";

const Forks = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  return (
    <>
      <div className="flex items-center w-full border-b pb-3">
        <div className="text-2xl">
          Forks of{" "}
          <b>
            {username}/{repository}
          </b>
        </div>
      </div>
      <ForksInsights />
    </>
  );
};

export default Forks;
