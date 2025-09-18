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

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  logger: () => logger
});
module.exports = __toCommonJS(logger_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  logger
});
