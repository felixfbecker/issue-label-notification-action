import {
  correctRecipients,
  correctMessage,
  messageTemplateToRegExp,
} from "./utils.mjs";

describe("correctRecipients", () => {
  test("changes nothing when configuration is correct", () => {
    const complexInput = `@docs-team @docs-team
    @docs-team @docs-team
    @docs-team @docs-team
    @docs-team @docs-team
    @docs-team  @docs-team
    @docs-team		@docs-team`;

    expect(correctRecipients(complexInput)).toBe(complexInput);
    expect(correctRecipients("@docs-team")).toBe("@docs-team");
    expect(correctRecipients("@1234")).toBe("@1234");
  });

  test("adds missing ambersands", () => {
    const input = `@docs-team docs-team
    docs-team @docs-team
    docs-team docs-team
    @docs-team @docs-team
    @docs-team  docs-team
    @docs-team		docs-team
    1234 @1234`;

    const output = `@docs-team @docs-team
    @docs-team @docs-team
    @docs-team @docs-team
    @docs-team @docs-team
    @docs-team  @docs-team
    @docs-team		@docs-team
    @1234 @1234`;

    expect(correctRecipients(input)).toBe(output);
  });
});

describe("correctMessage", () => {
  test("formats message when configuration is correct", () => {
    const input =
      'Heads up {recipients} - the "{label}" label was applied to this issue.';
    const recipients = "@docs-team @1234";
    const label = "documentation";

    const output =
      'Heads up @docs-team @1234 - the "documentation" label was applied to this issue.';

    expect(correctMessage(input, recipients, label)).toBe(output);
  });
});

describe("messageTemplateToRegExp", () => {
  test("returns a regexp that matches if a string includes the message already", () => {
    const pattern = "/cc {recipients}";
    const body = `
      This is a test issue.

      /cc @docs-team @1234
    `;
    expect(messageTemplateToRegExp(pattern).test(body)).toBe(true);
  });
  test("regexp does not match if string is not in the message", () => {
    const pattern = "/cc {recipients}";
    const body = `
      This is a test issue.
    `;
    expect(messageTemplateToRegExp(pattern).test(body)).toBe(false);
  });
  test("regexp can replace existing message", () => {
    const pattern = "/cc {recipients}";
    const bodyBefore = `
      This is a test issue.

      /cc @docs-team @some-team
    `;
    const bodyAfter = `
      This is a test issue.

      /cc @docs-team @other-team
    `;
    const regexp = messageTemplateToRegExp(pattern);
    const message = "/cc @docs-team @other-team";
    expect(bodyBefore.replace(regexp, message)).toBe(bodyAfter);
  });
});
