import { useRouter } from "next/router";
import { CommitsInsights } from "../../../../features/insights/commits-insights";

const Commits = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  return (
    <>
      <div className="flex items-center w-full border-b pb-3">
        <div className="text-2xl">
          Commits insights of{" "}
          <b>
            {username}/{repository}
          </b>
        </div>
      </div>
      <CommitsInsights />
    </>
  );
};

export default Commits;
