// src/utils/logger.ts
import chalk from "chalk";
import { inspect } from "util";
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
          inspect(msg, {
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
  printDate(chalk.redBright.bold);
  format(chalk.redBright, messages);
};
var warn = (...messages) => {
  if (logLevel() < logLevelKeys.warn) return;
  printDate(chalk.yellow.bold);
  format(chalk.yellowBright, messages);
};
var info = (...messages) => {
  if (logLevel() < logLevelKeys.info) return;
  printDate(chalk.blue.bold);
  format(chalk.blueBright, messages);
};
var debug = (...messages) => {
  if (logLevel() < logLevelKeys.debug) return;
  printDate(chalk.magenta.bold);
  format(chalk.magenta, messages);
};
var always = (...messages) => {
  printDate(chalk.grey.bold);
  format(chalk.greenBright, messages);
};
var logger = {
  error,
  warn,
  info,
  debug,
  always,
  logLevel
};

export {
  logger
};
