import type { MP } from "./MP";
import type { Commentator } from "./Commentator";

export interface Dialogue {
  message: string;
  sender: MP | Commentator;
}
