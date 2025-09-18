import {
  adjustCanvas
} from "./chunk-ZCYAQYG5.mjs";
import {
  logger
} from "./chunk-4GRGO5WO.mjs";

// src/plugin.ts
import * as fs from "fs";
import { existsSync } from "fs";
import * as path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sanitize from "sanitize-filename";
import { mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync } from "node:fs";
var updateSnapshot = async (options) => {
  const destDir = path.join(options.baseDirectory, options.spec.relative);
  const sanitizedFileName = sanitize(options.screenshotName);
  const destFile = path.join(destDir, `${sanitizedFileName}.png`);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(options.screenshotAbsolutePath, destFile);
  const fileBuffer = fs.readFileSync(destFile);
  logger.info(`Updated base snapshot '${options.screenshotName}' at ${destFile}`);
  return { images: { actual: fileBuffer.toString("base64") }, baseGenerated: true };
};
var compareSnapshots = async (options) => {
  const sanitizedFileName = sanitize(options.screenshotName);
  const retryAttempt = options.retryAttempt;
  const expectedImagePath = path.join(options.baseDirectory, options.spec.relative, `${sanitizedFileName}.png`);
  if (!existsSync(expectedImagePath)) {
    return { error: `Base screenshot not found at ${expectedImagePath}`, images: { actual: "" } };
  }
  const expectedImageBuffer = readFileSync2(expectedImagePath);
  const expectedImage = PNG.sync.read(expectedImageBuffer);
  const actualImagePath = options.screenshotAbsolutePath;
  const actualImageBuffer = readFileSync2(actualImagePath);
  const actualImage = PNG.sync.read(actualImageBuffer);
  const diffFileName = retryAttempt > 0 ? `${sanitizedFileName} (attempt ${retryAttempt + 1}).png` : `${sanitizedFileName}.png`;
  const diffImagePath = path.join(options.diffDirectory, options.spec.relative, diffFileName);
  const diffImage = new PNG({
    width: Math.max(actualImage.width, expectedImage.width),
    height: Math.max(actualImage.height, expectedImage.height)
  });
  const imgActualFullCanvas = adjustCanvas(actualImage, diffImage.width, diffImage.height);
  const imgExpectedFullCanvas = adjustCanvas(expectedImage, diffImage.width, diffImage.height);
  const mismatchedPixels = pixelmatch(
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
    mkdirSync2(path.dirname(diffImagePath), { recursive: true });
    const diffImageBuffer = PNG.sync.write(diffImage);
    writeFileSync(diffImagePath, diffImageBuffer);
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
export {
  compareSnapshots,
  configureVisualRegression,
  updateSnapshot
};
