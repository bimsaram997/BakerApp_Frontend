import { Pagination } from "../shared/pagination";

export class AddStock {
  ProductId: number;
  Unit: number;
  CostCode: number;
  SellingPrice: number;
  CostPrice: number;
  RecipeId: number;
  SupplyTypeId: number;
  SupplierId: number | null;
  ManufacturedDate: string;
  ExpiredDate: string;
  ItemQuantity: number;
  ReorderLevel: number;
  AddedDate: string;

}



export class StockListAdvanceFilter {
  SearchString: string | null;
  Pagination: Pagination;
  SortBy: string;
  IsAscending: boolean;
  ProductId: number | null;
  Unit: number | null;
  CostCode: number | null;
  RecipeId: number | null;
  SupplyTypeId: number | null;
  SupplierId: number | null;
  ManufacturedDate: string | null;
  ExpiredDate: string | null;
  ItemQuantity: number | null;
  ReorderLevel: number | null;
  AddedDate: string | null;
  SellingPrice: number | null;
  CostPrice: number | null;

}
export class AllStockVM {
  Id: number;
  MeasureUnitName: string | null;
  ProductName: string | null;
  CostCode: string | null;
  SellingPrice: number;
  CostPrice: number;
  RecipeName: string | null;
  SupplyTypeName: string | null;
  SupplierName: string | null;
  ManufacturedDate: string;
  ExpiredDate: string;
  ItemQuantity: number;
  ReorderLevel: number;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  BatchId: number;
  StockCode: string;
}export class StockVM {
  Id: number;
  Unit: number;
  ProductId: number;
  ProductName: string;
  CostCode: number;
  SellingPrice: number;
  CostPrice: number;
  RecipeId: number;
  SupplyTypeId: number;
  SupplierId: number | null;
  ManufacturedDate: string;
  ExpiredDate: string;
  ItemQuantity: number;
  ReorderLevel: number;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  BatchId: number;
  RawMaterialQuantities: RawMaterialQuantity[] | null;
}


export class RawMaterialQuantity {
  RawMaterialId: number;
  TotalQuantityNeeded: number;
}
export class PaginatedStocks {
  Items: AllStockVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}
