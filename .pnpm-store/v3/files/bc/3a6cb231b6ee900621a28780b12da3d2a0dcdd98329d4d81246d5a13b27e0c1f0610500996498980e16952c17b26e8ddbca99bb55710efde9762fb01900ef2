import { PluginCommandOptions, VisualRegressionResult, PluginOptions, TypeOption, DiffOption } from './plugin.mjs';
import 'pixelmatch';

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Take a screenshot and trigger a visual regression check
             * If visualRegressionType is set to 'base', create a base screenshot, no comparison takes place
             * If visualRegressionType is set to 'regression', compare base and current screenshots
             *
             * @param name - name of the screenshot file
             * @param commandOptions - additional screenshot and plugin options to control the visual regression behavior
             */
            compareSnapshot(name: string, commandOptions?: PluginCommandOptions): Chainable<VisualRegressionResult>;
        }
    }
}
type CypressConfigEnv = {
    visualRegressionType: TypeOption;
    visualRegressionBaseDirectory?: string;
    visualRegressionDiffDirectory?: string;
    visualRegressionGenerateDiff?: DiffOption;
    visualRegressionFailSilently?: boolean;
};
/** Add custom cypress command to compare image snapshots of an element or the window. */
declare function addCompareSnapshotCommand(screenshotOptions?: Partial<Cypress.ScreenshotOptions & PluginOptions>): void;

export { type CypressConfigEnv, addCompareSnapshotCommand };
