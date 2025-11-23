import { Container } from '../container/Container.ts';

export class ControllerDispatcher {
    //     use FiltersControllerMiddleware, ResolvesRouteDependencies;

    /**
     * The container instance.
     */
    protected container: Container;

    /**
     * Create a new controller dispatcher instance.
     */
    public constructor(container: Container) {
        this.container = container;
    }

    //     /**
    //      * Dispatch a request to a given controller and method.
    //      *
    //      * @param  \Illuminate\Routing\Route  $route
    //      * @param  mixed  $controller
    //      * @param  string  $method
    //      * @return mixed
    //      */
    //     public function dispatch(Route $route, $controller, $method)
    //     {
    //         $parameters = $this->resolveParameters($route, $controller, $method);

    //         if (method_exists($controller, 'callAction')) {
    //             return $controller->callAction($method, $parameters);
    //         }

    //         return $controller->{$method}(...array_values($parameters));
    //     }

    //     /**
    //      * Resolve the parameters for the controller.
    //      *
    //      * @param  \Illuminate\Routing\Route  $route
    //      * @param  mixed  $controller
    //      * @param  string  $method
    //      * @return array
    //      */
    //     protected function resolveParameters(Route $route, $controller, $method)
    //     {
    //         return $this->resolveClassMethodDependencies(
    //             $route->parametersWithoutNulls(), $controller, $method
    //         );
    //     }

    //     /**
    //      * Get the middleware for the controller instance.
    //      *
    //      * @param  \Illuminate\Routing\Controller  $controller
    //      * @param  string  $method
    //      * @return array
    //      */
    //     public function getMiddleware($controller, $method)
    //     {
    //         if (! method_exists($controller, 'getMiddleware')) {
    //             return [];
    //         }

    //         return (new Collection($controller->getMiddleware()))
    //             ->reject(fn ($data) => static::methodExcludedByOptions($method, $data['options']))
    //             ->pluck('middleware')
    //             ->all();
    //     }
}
