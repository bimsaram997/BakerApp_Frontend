export class AllProductVM {
  Id: number;
  ProductCode: string;
  AddedDate: string | null;
  ProductDescription: string;
  ProductPrice: number | null;
  ImageURL: string;
  FoodTypeId: number;
  FoodTypeName: string;
  BatchId: number;
  IsSold: boolean;
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
  AddedDate: string | null;
  ProductDescription: string;
  ProductPrice: number | null;
  ImageURL: string;
  FoodTypeId: number;
  BatchId: number;
  FoodTypeName: string | null;
  IsSold: boolean | null;
}

export class UpdateProduct {
  AddedDate: string | null;
  ProductDescription: string;
  ProductPrice: number | null;
  ImageURL: any | null;
  IsSold: boolean | null;
  Id: number | null;
}


export class AddProduct {
  ProductDescription: string;
  ProductPrice: number | null;
  ImageURL: string;
  AddedDate: string | null;
  FoodTypeId: number;
  ProductCount: number;
}
