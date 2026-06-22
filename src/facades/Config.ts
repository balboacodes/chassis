import type { Repository } from "../config/Repository.ts";
import { Facade } from "./Facade.ts";

export const Config = Facade.create<Repository>("chassis.config");
