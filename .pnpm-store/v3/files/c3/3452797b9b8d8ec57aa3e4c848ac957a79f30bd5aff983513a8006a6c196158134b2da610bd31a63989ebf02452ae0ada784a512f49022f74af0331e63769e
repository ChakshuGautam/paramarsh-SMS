"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugin.ts
var plugin_exports = {};
__export(plugin_exports, {
  compareSnapshots: () => compareSnapshots,
  configureVisualRegression: () => configureVisualRegression,
  updateSnapshot: () => updateSnapshot
});
module.exports = __toCommonJS(plugin_exports);
var fs = __toESM(require("fs"));
var import_fs = require("fs");
var path = __toESM(require("path"));
var import_pixelmatch = __toESM(require("pixelmatch"));
var import_pngjs2 = require("pngjs");
var import_sanitize_filename = __toESM(require("sanitize-filename"));

// src/utils/image.ts
var import_pngjs = require("pngjs");
var adjustCanvas = (image, width, height) => {
  if (image.width === width && image.height === height) {
    return image;
  }
  const imageAdjustedCanvas = new import_pngjs.PNG({ width, height, inputHasAlpha: true });
  import_pngjs.PNG.bitblt(image, imageAdjustedCanvas, 0, 0, image.width, image.height, 0, 0);
  return imageAdjustedCanvas;
};

// src/utils/logger.ts
var import_chalk = __toESM(require("chalk"));
var import_util = require("util");
var logLevelKeys = {
  debug: 3,
  info: 2,
  warn: 1,
  error: 0
};
var isLogLevel = (level) => {
  return level in logLevelKeys;
};
var logLevel = () => {
  const envLevel = isLogLevel(process.env.visual_regression_log ?? "") ? process.env.visual_regression_log ?? "error" : "error";
  return logLevelKeys[envLevel];
};
var format = (colorFormat, messages) => {
  for (const msg of messages) {
    if (typeof msg === "string") {
      console.log(colorFormat(msg));
    } else {
      console.log(
        colorFormat(
          (0, import_util.inspect)(msg, {
            showHidden: false,
            customInspect: false,
            colors: true,
            depth: null,
            maxArrayLength: Infinity
          })
        )
      );
    }
  }
};
var printDate = (colorFormat) => {
  console.log(colorFormat(`LOGGER [${(/* @__PURE__ */ new Date()).toISOString()}]`));
};
var error = (...messages) => {
  if (logLevel() < logLevelKeys.error) return;
  printDate(import_chalk.default.redBright.bold);
  format(import_chalk.default.redBright, messages);
};
var warn = (...messages) => {
  if (logLevel() < logLevelKeys.warn) return;
  printDate(import_chalk.default.yellow.bold);
  format(import_chalk.default.yellowBright, messages);
};
var info = (...messages) => {
  if (logLevel() < logLevelKeys.info) return;
  printDate(import_chalk.default.blue.bold);
  format(import_chalk.default.blueBright, messages);
};
var debug = (...messages) => {
  if (logLevel() < logLevelKeys.debug) return;
  printDate(import_chalk.default.magenta.bold);
  format(import_chalk.default.magenta, messages);
};
var always = (...messages) => {
  printDate(import_chalk.default.grey.bold);
  format(import_chalk.default.greenBright, messages);
};
var logger = {
  error,
  warn,
  info,
  debug,
  always,
  logLevel
};

// src/plugin.ts
var import_node_fs = require("fs");
var updateSnapshot = async (options) => {
  const destDir = path.join(options.baseDirectory, options.spec.relative);
  const sanitizedFileName = (0, import_sanitize_filename.default)(options.screenshotName);
  const destFile = path.join(destDir, `${sanitizedFileName}.png`);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(options.screenshotAbsolutePath, destFile);
  const fileBuffer = fs.readFileSync(destFile);
  logger.info(`Updated base snapshot '${options.screenshotName}' at ${destFile}`);
  return { images: { actual: fileBuffer.toString("base64") }, baseGenerated: true };
};
var compareSnapshots = async (options) => {
  const sanitizedFileName = (0, import_sanitize_filename.default)(options.screenshotName);
  const retryAttempt = options.retryAttempt;
  const expectedImagePath = path.join(options.baseDirectory, options.spec.relative, `${sanitizedFileName}.png`);
  if (!(0, import_fs.existsSync)(expectedImagePath)) {
    return { error: `Base screenshot not found at ${expectedImagePath}`, images: { actual: "" } };
  }
  const expectedImageBuffer = (0, import_node_fs.readFileSync)(expectedImagePath);
  const expectedImage = import_pngjs2.PNG.sync.read(expectedImageBuffer);
  const actualImagePath = options.screenshotAbsolutePath;
  const actualImageBuffer = (0, import_node_fs.readFileSync)(actualImagePath);
  const actualImage = import_pngjs2.PNG.sync.read(actualImageBuffer);
  const diffFileName = retryAttempt > 0 ? `${sanitizedFileName} (attempt ${retryAttempt + 1}).png` : `${sanitizedFileName}.png`;
  const diffImagePath = path.join(options.diffDirectory, options.spec.relative, diffFileName);
  const diffImage = new import_pngjs2.PNG({
    width: Math.max(actualImage.width, expectedImage.width),
    height: Math.max(actualImage.height, expectedImage.height)
  });
  const imgActualFullCanvas = adjustCanvas(actualImage, diffImage.width, diffImage.height);
  const imgExpectedFullCanvas = adjustCanvas(expectedImage, diffImage.width, diffImage.height);
  const mismatchedPixels = (0, import_pixelmatch.default)(
    imgActualFullCanvas.data,
    imgExpectedFullCanvas.data,
    diffImage.data,
    diffImage.width,
    diffImage.height,
    options.pluginOptions.pixelmatchOptions
  );
  const percentage = mismatchedPixels / diffImage.width / diffImage.height;
  const regressionError = percentage > options.pluginOptions.errorThreshold;
  const result = {
    images: {
      actual: actualImageBuffer.toString("base64"),
      base: expectedImageBuffer.toString("base64")
    },
    mismatchedPixels,
    percentage
  };
  if (options.generateDiff === "always" || regressionError && options.generateDiff === "fail") {
    (0, import_node_fs.mkdirSync)(path.dirname(diffImagePath), { recursive: true });
    const diffImageBuffer = import_pngjs2.PNG.sync.write(diffImage);
    (0, import_node_fs.writeFileSync)(diffImagePath, diffImageBuffer);
    result.images.diff = diffImageBuffer.toString("base64");
  }
  if (regressionError) {
    logger.error(`Error in visual regression found: ${percentage.toFixed(2)}`);
    result.error = `The '${options.screenshotName}' image is different. Threshold limit of '${options.pluginOptions.errorThreshold}' exceeded: '${percentage.toFixed(2)}'`;
  }
  return result;
};
var configureVisualRegression = (on) => {
  on("task", {
    compareSnapshots,
    updateSnapshot
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  compareSnapshots,
  configureVisualRegression,
  updateSnapshot
});
