import type { App as RealApp } from "../App.ts";
import { Facade } from "./Facade.ts";

export const App = Facade.create<RealApp>("chassis.app");
