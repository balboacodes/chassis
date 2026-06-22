import type { ChassisRequest } from "../../src/http/ChassisRequest.ts";
import type { ChassisResponse } from "../../src/http/ChassisResponse.ts";
import { Middleware } from "../../src/middleware/Middleware.ts";
import type { AsyncResponseHandler } from "../../src/types.ts";

export default class LogString extends Middleware {
  /**
   * @inheritdoc
   */
  public override async handle(
    request: ChassisRequest,
    next: AsyncResponseHandler,
  ): Promise<Response | ChassisResponse> {
    console.log("test");

    return await next(request);
  }
}
