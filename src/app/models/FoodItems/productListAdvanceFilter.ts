import { Pagination } from "../shared/pagination";


export class ProductListAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  FoodTypeId: number | null;
  FoodPrice: number | null;
  SearchString: string;
  AddedDate: Date | null;
  Pagination: Pagination;
  BatchId: number | null;
  Available: boolean;
}
