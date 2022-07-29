/******/ var __webpack_modules__ = ({

/***/ 411:
/***/ ((module) => {

module.exports = eval("require")("./utils");


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(411);
const core = require("@actions/core");
const github = require("@actions/github");


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
      const message = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.correctMessage)(messageTemplate, recipients, label);
      const recipients = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.correctRecipients)(match.split("=")[1]);
      if (core.getInput("edit_body")) {
        const issue = await octokit.issues.get({
          issue_number: issueNumber,
          owner,
          repo,
        });
        const regexp = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.messageTemplateToRegExp)(messageTemplate);
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

})();

