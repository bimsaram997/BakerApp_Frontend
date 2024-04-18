export class AllFoodItemVM {
  Id: number;
  FoodCode: string;
  AddedDate: string | null;
  FoodDescription: string;
  FoodPrice: number | null;
  ImageURL: string;
  FoodTypeId: number;
  FoodTypeName: string;
  BatchId: number;
  IsSold: boolean;
}
export class PaginatedFoodItems {
  Items: AllFoodItemVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class FoodItemVM {
  Id: number;
  FoodCode: string;
  AddedDate: string | null;
  FoodDescription: string;
  FoodPrice: number | null;
  ImageURL: string;
  FoodTypeId: number;
  BatchId: number;
  FoodTypeName: string | null;
  IsSold: boolean | null;
}

export class UpdateFoodItem {
  AddedDate: string | null;
  FoodDescription: string;
  FoodPrice: number | null;
  ImageURL: any | null;
  IsSold: boolean | null;
  Id: number | null;
}


export class AddFoodItem {
  FoodDescription: string;
  FoodPrice: number | null;
  ImageURL: string;
  AddedDate: string | null;
  FoodTypeId: number;
  FoodItemCount: number;
}
