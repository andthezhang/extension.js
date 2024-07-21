import type webpack from 'webpack';
import {
  handleMultipleAssetsError,
  handleTopLevelAwaitError,
  handleCantResolveError,
} from './steps/compilation-error-handlers';
import { type PluginInterface } from '../../../types';

export class CommonErrorsPlugin {
  public readonly manifestPath: string;

  constructor(options: PluginInterface) {
    this.manifestPath = options.manifestPath;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('develop:common-errors', (compilation) => {
      compilation.hooks.afterSeal.tapAsync('develop:common-errors', (done) => {
        // Handle errors related to compilation such
        // as multiple assets with the same name,
        // or missing dependencies.
        compilation.errors.forEach((error, index) => {
          const multipleAssetsError = handleMultipleAssetsError(
            this.manifestPath,
            error
          );
          const topLevelAwaitError = handleTopLevelAwaitError(
            this.manifestPath,
            error
          );
          const cantResolveError = handleCantResolveError(
            this.manifestPath,
            error
          );

          if (multipleAssetsError) {
            compilation.errors[index] = multipleAssetsError;
          }

          if (topLevelAwaitError) {
            compilation.errors[index] = topLevelAwaitError;
          }

          if (cantResolveError) {
            compilation.errors[index] = cantResolveError;
          }
        });

        done();
      });
    });
  }
}
