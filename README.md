# Chassis

[![publish](https://github.com/balboacodes/chassis/actions/workflows/publish.yml/badge.svg)](https://github.com/balboacodes/chassis/actions/workflows/publish.yml)

## About

Chassis is an experimental [Laravel-style](https://github.com/laravel/laravel)
framework built for [Deno](https://github.com/denoland/deno). It currently has
basic support for:

- service container
- service providers
- routes
- middleware
- `.env` and config files
- App, Config, and Route facades
- route helper

## Installation

TBD

## Usage

### Service Container

```ts
import { App } from "@balboacodes/chassis";

// Bind a class
class SomeClass {
  public constructor(public someProperty: string) {}
}

App.bind(SomeClass);
App.resolve(SomeClass, ["property value"]); // returns a new SomeClass instance with someProperty set to 'property value'

// Create a singleton
App.singleton("register", 123);
App.resolve("register"); // 123
```

### Service Providers

`app/providers/AppServiceProvider.ts`

```ts
import { Abstract, App, ServiceProvider } from "@balboacodes/chassis";

export default class AppServiceProvider extends ServiceProvider {
  public override singletons: Map<Abstract, unknown> = new Map([
    ["singleton", () => "testing"],
  ]);

  public override register(): void {
    App.bind("register", 123);
  }
}
```

### Routes

`routes/web.ts`

```ts
import { ChassisResponse, Redirect, Route } from "@balboacodes/chassis";
import UsersController from "../app/controllers/UsersControllers.ts";
import LogTime from "../app/middleware/LogTime.ts";

export default (): void => {
  // Named route returning a view
  Route.name("home").get(
    "/",
    (request) => new ChassisResponse(request).view("home"),
  );

  // Route with middleware using a resource controller
  Route.middleware([LogTime]).resource("users", UsersController);

  // Route with parameter
  Route.get("/users/:id", [UsersController, "show"]);

  // Redirect route
  Route.redirect("/redirect", "/");
};
```

### Middleware

`app/middleware/LogTime.ts`

```ts
import {
  AsyncResponseHandler,
  ChassisRequest,
  ChassisResponse,
  Middleware,
} from "@balboacodes/chassis";

export default class LogTime extends Middleware {
  /**
   * @inheritdoc
   */
  public override async handle(
    request: ChassisRequest,
    next: AsyncResponseHandler,
  ): Promise<Response | ChassisResponse> {
    console.log(Date.now());

    return await next(request);
  }
}
```

### `.env` And Config Files

`.env`

`APP_ENV=development`

`config/app.ts`

```ts
export default {
  env: Deno.env.get("APP_ENV") ?? "development",
  // ...
};
```

### App, Config, And Route Facades

```ts
import { App, Config, Route } from "@balboacodes/chassis";

App.bind("something", "something else");
Config.get("app.env");
Route.get("/users/:id", [UsersController, "show"]);
```

You can also create your own facades.

```ts
import { App, Facade } from '@balboacodes/chassis';
import Something as RealSomething from '../Something.ts';

App.bind(RealSomething);

export const Something = Facade.create<RealSomething>(RealSomething);
```

### Route Helper

`routes/web.ts`

```ts
import { ChassisResponse, Redirect, Route } from "@balboacodes/chassis";
import UsersController from "../app/controllers/UsersControllers.ts";
import LogTime from "../app/middleware/LogTime.ts";

export default (): void => {
  Route.name("home").get(
    "/",
    (request) => new ChassisResponse(request).view("home"),
  );
};
```

Somewhere else...

```ts
import { route } from "@balboacodes/chassis";

route("home"); // goes to /
```

## Documentation

TBD

## Related

If you like this package, be sure to check out our
[other packages](https://www.npmjs.com/~balboacodes).
