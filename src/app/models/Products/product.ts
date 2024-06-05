export class AllProductVM {
  Id: number;
  Name: string | null;
  ProductCode: string;
  AddedDate: string | null;
  ModifiedDate: string | null;
  ProductDescription: string;
  SellingPrice: number | null;
  CostPrice: number | null;
  ImageURL: string;
  Unit: number | null;
  CostCode: number | null;
  RecipeId: number | null;
  RecipeName: string;
  UnitName: string
}
export class PaginatedProducts {
  Items: AllProductVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class ProductVM {
  Id: number;
  ProductCode: string;
  Name: string;
  Unit: number;
  CostCode: number;
  CostPrice: number;
  SellingPrice: number;
  RecipeId: number;
  ProductDescription: string;
  ImageURL: string;
  AddedDate: string | null;
  ModifiedDate: string | null;
  IsDeleted: boolean;
}



export class AddProduct {
  ProductDescription: string;
  ProductPrice: number | null;
  ImageURL: string;
  AddedDate: string | null;
  FoodTypeId: number;
  ProductCount: number;
}

export class RecipeListSimpleVM {
  Id: number;
  RecipeName: string;
}


export class AddProductRequest {
  Name: string;
  Unit: number;
  CostCode: number;
  CostPrice: number;
  SellingPrice: number;
  RecipeId: number;
  ProductDescription: string;
  ImageURL: string;
  AddedDate: string;
}

export class UpdateProduct {
  Name: string;
  Unit: number;
  CostCode: number;
  CostPrice: number;
  SellingPrice: number;
  RecipeId: number;
  ProductDescription: string;
  ImageURL: string;
}


export enum CostCode {
  "CC001 Bakery products" = 0,
  "CC002 Vegetables" = 1,
  "CC003 Diary products" = 2
}

export enum Unit {
  "PCS" = 0,
  "HRS" = 1,

}
