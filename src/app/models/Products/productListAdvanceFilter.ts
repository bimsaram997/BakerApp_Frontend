import { Pagination } from "../shared/pagination";

export interface ProductListAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  SellingPrice: number | null;
  CostPrice: number | null;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
  Unit: number | null;
  CostCode: number | null;
  RecipeId: number | null;
}
