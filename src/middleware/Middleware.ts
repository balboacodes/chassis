import type { ChassisRequest } from "../http/ChassisRequest.ts";
import { ChassisResponse } from "../http/ChassisResponse.ts";
import type { AsyncResponseHandler } from "../types.ts";

export abstract class Middleware {
  /**
   * Handle incomming requests.
   */
  public abstract handle(
    request: ChassisRequest,
    next: AsyncResponseHandler,
  ): Promise<Response | ChassisResponse>;
}
