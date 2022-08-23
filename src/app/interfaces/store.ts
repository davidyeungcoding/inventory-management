// import { User } from './user';
import { Item } from './item';
import { Ingredient } from './ingredient';

export interface Store {
  _id: string,
  name: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  // users: User[],
  items: Item[],
  ingredients: Ingredient[]
};
