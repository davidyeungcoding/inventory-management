import { Ingredient } from "./ingredient"
import { Item } from "./item"

interface LineItem {
  quantity: number,
  orderItem: Item,
  totalCost: string
}

interface IngredientList {
  quantity: number,
  orderIngredient: Ingredient
}

export interface Order {
  _id: string,
  date: string,
  orderItems: LineItem[],
  orderIngredients: IngredientList[],
  orderTotal: string,
  store: string
}
