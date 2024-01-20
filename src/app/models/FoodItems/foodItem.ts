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

