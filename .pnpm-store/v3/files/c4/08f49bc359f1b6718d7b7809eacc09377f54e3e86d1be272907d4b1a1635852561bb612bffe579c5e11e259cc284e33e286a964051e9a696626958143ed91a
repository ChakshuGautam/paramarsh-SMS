// src/command.ts
function addCompareSnapshotCommand(screenshotOptions) {
  Cypress.Commands.add(
    "compareSnapshot",
    { prevSubject: ["optional", "element"] },
    function(subject, name, commandOptions) {
      if (name === void 0 || name === "") {
        throw new Error("Snapshot name must be specified");
      }
      const screenshotOptionsObject = { ...screenshotOptions };
      const commandOptionsObject = typeof commandOptions === "number" ? { errorThreshold: commandOptions } : { ...commandOptions };
      const visualRegressionOptions = prepareOptions(name, screenshotOptionsObject, commandOptionsObject);
      const folderAndName = `${Cypress.spec.relative}/${name}`;
      return takeScreenshot(subject, folderAndName, visualRegressionOptions.screenshotOptions).then(
        (screenshotPath) => {
          visualRegressionOptions.screenshotAbsolutePath = screenshotPath;
          visualRegressionOptions.spec = Cypress.spec;
          switch (visualRegressionOptions.type) {
            case "regression":
              return compareScreenshots(subject, visualRegressionOptions);
            case "base":
              return updateSnapshots(subject, visualRegressionOptions);
            default:
              throw new Error(
                `The 'type' environment variable is invalid. Expected: 'regression' or 'base' instead of '${visualRegressionOptions.type}'`
              );
          }
        }
      );
    }
  );
}
function prepareOptions(name, screenshotOptions, commandOptions) {
  if (Cypress.env("visualRegressionType") === void 0) {
    throw new Error("The 'type' environment variable is missing. Expected values: 'regression' or 'base'");
  }
  const defaultCommandOptions = {
    errorThreshold: 0,
    failSilently: false,
    pixelmatchOptions: { threshold: 0.1 }
  };
  const options = {
    type: Cypress.env("visualRegressionType"),
    screenshotName: name,
    screenshotAbsolutePath: "null",
    // will be set after takeScreenshot
    pluginOptions: defaultCommandOptions,
    screenshotOptions: {},
    baseDirectory: "cypress/snapshots/base",
    diffDirectory: "cypress/snapshots/diff",
    generateDiff: "fail",
    spec: Cypress.spec
  };
  if (screenshotOptions.pixelmatchOptions !== void 0) {
    options.pluginOptions.pixelmatchOptions = screenshotOptions.pixelmatchOptions;
  }
  if (screenshotOptions.errorThreshold !== void 0) {
    options.pluginOptions.errorThreshold = screenshotOptions.errorThreshold;
  }
  if (screenshotOptions.failSilently !== void 0) {
    options.pluginOptions.failSilently = screenshotOptions.failSilently;
  }
  options.screenshotOptions = { ...screenshotOptions, ...commandOptions };
  if (Cypress.env("visualRegressionBaseDirectory") !== void 0) {
    options.baseDirectory = Cypress.env("visualRegressionBaseDirectory");
  }
  if (Cypress.env("visualRegressionDiffDirectory") !== void 0) {
    options.diffDirectory = Cypress.env("visualRegressionDiffDirectory");
  }
  if (Cypress.env("visualRegressionGenerateDiff") !== void 0) {
    options.generateDiff = Cypress.env("visualRegressionGenerateDiff");
  }
  if (Cypress.env("visualRegressionFailSilently") !== void 0) {
    options.pluginOptions.failSilently = Cypress.env("visualRegressionFailSilently");
  }
  if (commandOptions.failSilently !== void 0) {
    options.pluginOptions.failSilently = commandOptions.failSilently;
  }
  if (commandOptions.errorThreshold !== void 0) {
    options.pluginOptions.errorThreshold = commandOptions.errorThreshold;
  }
  if (commandOptions.pixelmatchOptions !== void 0) {
    options.pluginOptions.pixelmatchOptions = commandOptions.pixelmatchOptions;
  }
  return options;
}
function takeScreenshot(subject, name, screenshotOptions) {
  const objToOperateOn = subject !== void 0 ? cy.get(subject) : cy;
  let screenshotDetails;
  return objToOperateOn.screenshot(name, {
    ...screenshotOptions,
    log: false,
    onAfterScreenshot(_el, props) {
      screenshotDetails = props.path;
      screenshotOptions?.onAfterScreenshot?.(_el, props);
    }
  }).then(() => screenshotDetails);
}
function compareScreenshots(subject, options) {
  const retryAttempt = Cypress.currentRetry;
  const compareSnapshotsOptions = { retryAttempt, ...options };
  return cy.task("compareSnapshots", compareSnapshotsOptions, { log: false }).then((result) => {
    const log = Cypress.log({
      type: "parent",
      name: "compareScreenshots",
      displayName: "compareScreenshots",
      message: "captureMode: 'fullPage'",
      consoleProps: () => {
        return {
          Options: options,
          Result: result
        };
      }
    });
    if (subject != null) {
      log.set("$el", subject);
      log.set("message", subject.selector);
      log.set("type", "child");
    } else if (options.screenshotOptions?.capture !== void 0) {
      log.set("message", `captureMode: ${options.screenshotOptions.capture}`);
    }
    if (result.error !== void 0 && !options.pluginOptions.failSilently) {
      if (result.error.includes("image is different") && top !== null) {
        const random = Math.random();
        result.error += ` - [Show Difference](#visualRegressionPopup${random})`;
        Cypress.$(top.document.body).on("click", `a[href^="#visualRegressionPopup${random}"]`, (e) => {
          e.preventDefault();
          if (top === null) {
            throw Error("Cypress runner not properly initialized");
          }
          Cypress.$(getVisual(result.images)).appendTo(top.document.body);
          if (result.images.diff === void 0) {
            Cypress.$("#diffContainer", top.document.body).remove();
          }
          const popup = Cypress.$("#visualRegressionPopup", top.document.body);
          popup.on("click", 'button[data-type="close"]', () => {
            popup.remove();
          });
          popup.on("click", function(e2) {
            if (e2.target === this) {
              popup.remove();
            }
          });
          return false;
        });
      }
      throw constructCypressError(log, new Error(result.error));
    }
    return result;
  });
}
function updateSnapshots(subject, options) {
  return cy.task("updateSnapshot", options, { log: false }).then((result) => {
    const log = Cypress.log({
      type: "parent",
      name: "compareScreenshots",
      displayName: "compareScreenshots",
      message: "base generation",
      consoleProps: () => {
        return {
          Options: options,
          Result: result
        };
      }
    });
    if (subject != null) {
      log.set("$el", subject);
      log.set("type", "child");
    }
    return result;
  });
}
var constructCypressError = (log, err) => {
  ;
  err.onFail = (err2) => log.error(err2);
  return err;
};
function getVisual(images) {
  return `
<div id="visualRegressionPopup" style="position:fixed;z-index:10;top:0;bottom:0;left:0;right:0;display:flex;flex-flow:column;backdrop-filter:blur(5px)">
  <div class="runner" style="position:fixed;top:100px;bottom:100px;left:100px;right:100px;display:flex;flex-flow:column">
    <header style="position:static">
    <nav style="display:flex;width:100%;align-items:center;justify-content:space-between;padding:10px 15px;">
      <h2>Visual Regression Plugin - screenshot difference inspection</h2>
      <form style="display:flex;align-items:center;gap:5px;text-align:right">
        <button style="background-color:white;color:rgb(73 86 227);border-radius:4px" type="button" data-type="close"><i class="fa fa-times"></i> Close</button>
      <form>
    </nav>
    </header>
    <div style="padding:15px;overflow:auto">
      <div style="display:flex;justify-content:space-evenly;align-items:flex-start;gap:15px">
        <div id="imageContainer"
          style="position:relative;background:#fff;border:solid 15px #fff"
        >
          <img alt="Actual image" style="min-width:300px;width:100%;" src="data:image/png;base64,${images.actual}" />
          <img id="baseImage" alt="Base image" style="position:absolute;top:0;left:0;min-width:300px;width:100%" src="data:image/png;base64,${images.base}" />
          <div id="redLine" style="position: absolute; top: 0; height: 100%; width: 2px; background-color: red; display: none;"></div>
        </div>
        <div id="diffContainer" style="background:#fff;border:solid 15px #fff">
          <img alt="Diff image" style="min-width:300px;width:100%" src="data:image/png;base64,${images.diff}" />
        </div>
      </div>
    </div>
  </div>
</div>
<script>
  document.getElementById('imageContainer').addEventListener('mousemove', (e) => {
    const containerRect = document.getElementById('imageContainer').getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const width = containerRect.width

    // Calculate the percentage position of the mouse relative to the container
    const percentage = (mouseX / width) * 100

    // Update the clip-path to show part of the second image based on the mouse position
    document.getElementById('baseImage').style.clipPath = \`inset(0 \${100 - percentage}% 0 0)\`
    
    // Update the red line
    document.getElementById('redLine').style.left = \`\${mouseX}px\`
    document.getElementById('redLine').style.display = 'block'
  })
</script>
`;
}
export {
  addCompareSnapshotCommand
};
