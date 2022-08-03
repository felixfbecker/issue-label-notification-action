import escapeRegexp from "escape-string-regexp";

/**
 * @param {string} recipients
 * @returns {string}
 */
export function correctRecipients(recipients) {
  const regex = /(^| +|\t+)(?!@)(\w+)/gm;
  return recipients.replace(regex, "$1@$2");
}

/**
 * @param {string} message
 * @param {string} recipients
 * @param {string} label
 * @returns {string}
 */
export function correctMessage(message, recipients, label) {
  return message.replace("{recipients}", recipients).replace("{label}", label);
}

/**
 * @param {string} message
 * @returns {RegExp}
 */
export function messageTemplateToRegExp(message) {
  return new RegExp(
    escapeRegexp(message)
      .replace("\\{recipients\\}", "(@[\\w_-]+)( @[\\w_-]+)*")
      .replace("\\{label\\}", ".+")
  );
}
