import { Order } from "./order";

export interface Store {
  _id: string,
  name: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  users: [],
  items: [],
  ingredients: [],
  orders: Order[]
}
