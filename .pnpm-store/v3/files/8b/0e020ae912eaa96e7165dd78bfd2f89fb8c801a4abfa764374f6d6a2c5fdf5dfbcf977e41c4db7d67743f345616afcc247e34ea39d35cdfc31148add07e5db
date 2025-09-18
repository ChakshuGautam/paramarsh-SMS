import { PixelmatchOptions } from 'pixelmatch';

type PluginOptions = {
    errorThreshold: number;
    failSilently: boolean;
    pixelmatchOptions: PixelmatchOptions;
};
type PluginCommandOptions = number | Partial<Cypress.ScreenshotOptions & PluginOptions>;
type DiffOption = 'always' | 'fail' | 'never';
type TypeOption = 'regression' | 'base';
type VisualRegressionOptions = {
    /** kind of comparison that we are going to execute */
    type: TypeOption;
    /** new image name */
    screenshotName: string;
    /** absolute path and name of the original image **_including file termination_** */
    screenshotAbsolutePath: string;
    /** cypress screenshot options (currently bundled together with pluginOptions) */
    screenshotOptions: Partial<Cypress.ScreenshotOptions>;
    /** visual regression plugin options */
    pluginOptions: PluginOptions;
    /** base directory where to move the image (defaults to **'cypress/snapshots/base'**) */
    baseDirectory: string;
    /** diff directory were we store the diff images (defaults to **'cypress/snapshots/diff'**) */
    diffDirectory: string;
    /** how we should handle diff images */
    generateDiff: DiffOption;
    /** Cypress spec file object info */
    spec: Cypress.Spec;
};
type UpdateSnapshotOptions = Pick<VisualRegressionOptions, 'screenshotName' | 'screenshotAbsolutePath' | 'baseDirectory' | 'spec' | 'type'>;
type VisualRegressionImages = {
    actual: string;
    base?: string;
    diff?: string;
};
type VisualRegressionResult = {
    error?: string;
    images: VisualRegressionImages;
    baseGenerated?: boolean;
    mismatchedPixels?: number;
    percentage?: number;
};
/**
 * Update the base snapshot .png by copying the generated snapshot to the base snapshot directory.
 * The target path is constructed from parts at runtime in node to be OS independent.
 * */
declare const updateSnapshot: (options: UpdateSnapshotOptions) => Promise<VisualRegressionResult>;
/**
 * Cypress plugin to compare image snapshots & generate a diff image.
 * Uses the pixelmatch library internally.
 * */
declare const compareSnapshots: (options: VisualRegressionOptions & {
    retryAttempt: number;
}) => Promise<VisualRegressionResult>;
/** Configure the plugin to compare snapshots. */
declare const configureVisualRegression: (on: Cypress.PluginEvents) => void;

export { type DiffOption, type PluginCommandOptions, type PluginOptions, type TypeOption, type UpdateSnapshotOptions, type VisualRegressionImages, type VisualRegressionOptions, type VisualRegressionResult, compareSnapshots, configureVisualRegression, updateSnapshot };
