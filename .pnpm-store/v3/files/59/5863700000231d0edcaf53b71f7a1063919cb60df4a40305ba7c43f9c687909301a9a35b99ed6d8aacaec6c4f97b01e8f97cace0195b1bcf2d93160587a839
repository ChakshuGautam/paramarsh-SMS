// src/utils/image.ts
import { PNG } from "pngjs";
var adjustCanvas = (image, width, height) => {
  if (image.width === width && image.height === height) {
    return image;
  }
  const imageAdjustedCanvas = new PNG({ width, height, inputHasAlpha: true });
  PNG.bitblt(image, imageAdjustedCanvas, 0, 0, image.width, image.height, 0, 0);
  return imageAdjustedCanvas;
};

export {
  adjustCanvas
};
