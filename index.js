const core = require("@actions/core");
const github = require("@actions/github");
import {
  correctRecipients,
  correctMessage,
  messageTemplateToRegExp,
} from "./utils";

async function run() {
  try {
    const issueNumber = github.context.payload.issue.number;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const label = github.context.payload.label.name;

    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);

    const labelRecipients = core.getInput("recipients").split("\n");
    const match = labelRecipients.find((labelRecipient) => {
      return labelRecipient.split("=")[0] === label;
    });

    const messageTemplate = core.getInput("message");

    if (match) {
      const message = correctMessage(messageTemplate, recipients, label);
      const recipients = correctRecipients(match.split("=")[1]);
      if (core.getInput("edit_body")) {
        const issue = await octokit.issues.get({
          issue_number: issueNumber,
          owner,
          repo,
        });
        const regexp = messageTemplateToRegExp(messageTemplate);
        // If body already contains message, replace it, otherwise append
        const updatedBody = issue.body.test(regexp)
          ? issue.body.replace(regexp, message)
          : issue.body + `\n\n${message}`;
        await octokit.issues.update({
          owner,
          repo,
          issue_number: issueNumber,
          body: updatedBody,
        });
      } else {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: message,
        });
      }
    } else {
      console.log("No matching recipients found for label ${label}.");
    }
  } catch (error) {
    console.error(error);
    core.setFailed(
      `The issue-label-notification-action action failed with ${error}`
    );
  }
}

run();
