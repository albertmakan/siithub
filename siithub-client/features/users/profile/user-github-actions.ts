import axios from "axios";
import * as z from "zod";
import { GITHUB_ACCOUNT } from "../../../patterns";

const changeGithubAccountBodySchema = z.object({
  username: z.string().regex(GITHUB_ACCOUNT, "Github username should be valid."),
});

type ChangeGithubAccount = z.infer<typeof changeGithubAccountBodySchema>;

function changeGithubAccount() {
  return (githubAccount: ChangeGithubAccount) => axios.put(`/api/users/github`, githubAccount);
}

function deleteGithubAccount() {
  return () => axios.delete(`/api/users/github`);
}

export { changeGithubAccountBodySchema, changeGithubAccount, deleteGithubAccount };

export type { ChangeGithubAccount };
