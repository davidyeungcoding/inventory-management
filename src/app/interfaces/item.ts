import { Ingredient } from "./ingredient";
import { Store } from "./store";

export interface Item {
  _id: string,
  name: string,
  price: string,
  active: boolean,
  available: boolean,
  ingredients: Ingredient[],
  store: Store
}
