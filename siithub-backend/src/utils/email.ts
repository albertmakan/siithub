import { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";
import { type User } from "../features/user/user.model";
import { type Repository } from "../features/repository/repository.model";
import { fillTemplate, getHTMLTemplate } from "../templates/utils";

const SES = new SESClient({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY ?? "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.REGION,
});

export const sendInvitationMail = async (user: User, repo: Repository) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [user.email] },
    Message: {
      Body: {
        Html: {
          Data: fillTemplate(getHTMLTemplate("invitation"), {
            owner: repo.owner,
            ownerLink: `${process.env.CLIENT_URL}/users/${repo.owner}`,
            repository: repo.name,
            invitationLink: `${process.env.CLIENT_URL}/${repo.owner}/${repo.name}/invitation`,
            user: user.username,
            userEmail: user.email,
          }),
        },
      },
      Subject: { Data: `${repo.owner} invited you to ${repo.owner}/${repo.name}` },
    },
    Source: "siithub.aws.noreply@gmail.com",
  });
  const res = await SES.send(command);
  return res.MessageId;
};

export const verifyEmail = async (email: string) => {
  const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
  await SES.send(command);
};
