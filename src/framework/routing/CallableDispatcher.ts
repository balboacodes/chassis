import { Container } from '../container/Container.ts';

export class CallableDispatcher {
    //     use ResolvesRouteDependencies;

    /**
     * The container instance.
     */
    protected container: Container;

    /**
     * Create a new callable dispatcher instance.
     */
    public constructor(container: Container) {
        this.container = container;
    }

    //     /**
    //      * Dispatch a request to a given callable.
    //      *
    //      * @param  \Illuminate\Routing\Route  $route
    //      * @param  callable  $callable
    //      * @return mixed
    //      */
    //     public function dispatch(Route $route, $callable)
    //     {
    //         return $callable(...array_values($this->resolveParameters($route, $callable)));
    //     }

    //     /**
    //      * Resolve the parameters for the callable.
    //      *
    //      * @param  \Illuminate\Routing\Route  $route
    //      * @param  callable  $callable
    //      * @return array
    //      */
    //     protected function resolveParameters(Route $route, $callable)
    //     {
    //         return $this->resolveMethodDependencies($route->parametersWithoutNulls(), new ReflectionFunction($callable));
    //     }
}
