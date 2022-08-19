import { Store } from "./store";

export interface Ingredient {
  _id: string,
  name: string,
  foundIn: [],
  store: Store
}
