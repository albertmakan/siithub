import { useRouter } from "next/router";
import { ContributorsInsights } from "../../../../../features/insights/contributors-insights";

const Contributors = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  return (
    <>
      <div className="flex items-center w-full border-b pb-3">
        <div className="text-2xl">
          Contributors insights of{" "}
          <b>
            {username}/{repository}
          </b>
        </div>
      </div>
      <ContributorsInsights />
    </>
  );
};

export default Contributors;
