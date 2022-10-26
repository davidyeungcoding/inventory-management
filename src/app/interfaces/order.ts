interface LineItem {
  quantity: number,
  itemId: string,
  name: string,
  ingredients: string[],
  totalCost: string
}

interface IngredientList {
  quantity: number,
  ingredientId: string,
  name: string
}

export interface Order {
  _id: string,
  date: string,
  orderItems: LineItem[],
  orderIngredients: IngredientList[],
  orderTotal: string,
  store: string
}
