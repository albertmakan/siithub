import {
  SESClient,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
  SendTemplatedEmailCommand,
  UpdateTemplateCommand,
} from "@aws-sdk/client-ses";
import { type User } from "../../features/user/user.model";
import { type Repository } from "../../features/repository/repository.model";
import { fillTemplate, getHTMLTemplate } from "../../templates/utils";
import { awsConfig } from "./config";

const SES = new SESClient(awsConfig);

export const sendInvitationMailNT = async (user: User, repo: Repository) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [user.email] },
    Message: {
      Body: {
        Html: {
          Data: fillTemplate(getHTMLTemplate("invitation"), {
            owner: repo.owner,
            ownerLink: `${process.env.CLIENT_URL}/users/${repo.owner}`,
            repository: repo.name,
            invitationLink: `${process.env.CLIENT_URL}/r/${repo.owner}/${repo.name}/invitation`,
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

export const sendInvitationMail = async (user: User, repo: Repository) => {
  const command = new SendTemplatedEmailCommand({
    Destination: { ToAddresses: [user.email] },
    Source: "siithub.aws.noreply@gmail.com",
    Template: "CollaboratorInvitation",
    TemplateData: JSON.stringify({
      owner: repo.owner,
      ownerLink: `${process.env.CLIENT_URL}/users/${repo.owner}`,
      repository: repo.name,
      invitationLink: `${process.env.CLIENT_URL}/r/${repo.owner}/${repo.name}/invitation`,
      user: user.username,
      userEmail: user.email,
    }),
  });
  const res = await SES.send(command);
  return res.MessageId;
};

export const verifyEmail = async (email: string) => {
  const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
  await SES.send(command);
};

export const updatateEmailTemplate = async () => {
  const command = new UpdateTemplateCommand({
    Template: {
      TemplateName: "CollaboratorInvitation",
      SubjectPart: "{{owner}} invited you to {{owner}}/{{repository}} on SiitHub",
      HtmlPart: `
<body style="font-family: Arial, sans-serif">
  <h2 style="text-align: center">SiitHub</h2>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid black">
    <div style="margin: 20px 0">
      <h2 style="text-align: center">
        @{{owner}} has invited you to collaborate on the {{owner}}/{{repository}} repository
      </h2>
      <hr />
      <p>
        You can accept or decline this invitation. You can also visit
        <a href="{{ownerLink}}">@{{owner}}</a> to learn a bit more about
        them.
      </p>
      <div style="text-align: center">
        <a
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          "
          href="{{invitationLink}}"
          >View invitation</a
        >
      </div>
      <p>
        <b>Note:</b> This invitation was intended for {{userEmail}}. If you were not expecting this invitation, you can
        ignore this email.
      </p>
      <hr />
      <p>Getting an error or empty page? Make sure you're signed in as <b>{{user}}</b>.</p>
      <p>
        Button not working? Copy and paste this link into your browser: <br />
        {{invitationLink}}
      </p>
    </div>
  </div>
</body>
    `,
      TextPart: `
SiitHub
@{{owner}} has invited you to collaborate on the {{owner}}/{{repository}} repository
You can accept or decline this invitation. You can also visit
{{ownerLink}}
to learn a bit more about them.
This invitation was intended for {{userEmail}}. If you were not expecting this invitation, you can ignore this email.
Invitation link:
{{invitationLink}}
Getting an error or empty page? Make sure you're signed in as {{user}}.
    `,
    },
  });

  await SES.send(command);
};
