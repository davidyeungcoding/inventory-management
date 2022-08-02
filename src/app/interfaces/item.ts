import { Ingredient } from "./ingredient";

export interface Item {
  _id: string,
  name: string,
  price: string,
  ingredients: Ingredient[],
  active: boolean,
  available: boolean
}
