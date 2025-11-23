import { array_filter, array_merge, array_unique } from '@balboacodes/php-utils';

export class RegisterProviders {
    /**
     * The service providers that should be merged before registration.
     */
    protected static shouldMerge: unknown[] = [];

    /**
     * The path to the bootstrap provider configuration file.
     */
    protected static bootstrapProviderPath?: string;

    //     /**
    //      * Bootstrap the given application.
    //      *
    //      * @param  \Illuminate\Contracts\Foundation\Application  $app
    //      * @return void
    //      */
    //     public function bootstrap(Application $app)
    //     {
    //         if (! $app->bound('config_loaded_from_cache') ||
    //             $app->make('config_loaded_from_cache') === false) {
    //             $this->mergeAdditionalProviders($app);
    //         }

    //         $app->registerConfiguredProviders();
    //     }

    //     /**
    //      * Merge the additional configured providers into the configuration.
    //      *
    //      * @param  \Illuminate\Foundation\Application  $app
    //      */
    //     protected function mergeAdditionalProviders(Application $app)
    //     {
    //         if (static::$bootstrapProviderPath &&
    //             file_exists(static::$bootstrapProviderPath)) {
    //             $packageProviders = require static::$bootstrapProviderPath;

    //             foreach ($packageProviders as $index => $provider) {
    //                 if (! class_exists($provider)) {
    //                     unset($packageProviders[$index]);
    //                 }
    //             }
    //         }

    //         $app->make('config')->set(
    //             'app.providers',
    //             array_merge(
    //                 $app->make('config')->get('app.providers') ?? ServiceProvider::defaultProviders()->toArray(),
    //                 static::$merge,
    //                 array_values($packageProviders ?? []),
    //             ),
    //         );
    //     }

    /**
     * Merge the given providers into the provider configuration before registration.
     */
    public static merge(providers: unknown[], bootstrapProviderPath?: string): void {
        RegisterProviders.bootstrapProviderPath = bootstrapProviderPath;

        RegisterProviders.shouldMerge = Object.values(array_filter(array_unique(
            array_merge(RegisterProviders.shouldMerge, providers),
        )));
    }

    //     /**
    //      * Flush the bootstrapper's global state.
    //      *
    //      * @return void
    //      */
    //     public static function flushState()
    //     {
    //         static::$bootstrapProviderPath = null;

    //         static::$merge = [];
    //     }
}
