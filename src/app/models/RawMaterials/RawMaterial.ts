import { Pagination } from "../shared/pagination";

export enum QuantityType {
  Kg =0,
  L = 1
}

export class AddRawMaterial {
  Name: string;
  Quantity: number;
  AddedDate: string | null;
  ImageURL: string;
  RawMaterialQuantityType: QuantityType;
}

export class RawMaterialVM {
  Id: number;
  RawMaterialCode: string;
  Name: string;
  Quantity: number;
  AddedDate: string | null;
  ImageURL: string;
  RawMaterialQuantityType: QuantityType;
  IsDeleted: boolean;
  ModifiedDate: string | null;
}


export class AllRawMaterialVM {
  Id: number;
  Name: string;
  AddedDate: string | null;
  RawMaterialQuantityType:  QuantityType;
  Quantity: number | null;
  ImageURL: string;
  ModifiedDate: string | null;
  RawMaterialCode: string | null;
}

export interface PaginatedRawMaterials {
  Items: AllRawMaterialVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class RawMaterialListAdvanceFilter {
  Quantity: number | null;
  SearchString: string | null;
  AddedDate: string | null;
  RawMaterialQuantityType: QuantityType | null;
  Pagination: Pagination;
  SortBy: string;
  IsAscending: boolean;
}


export class UpdateRawMaterial {
  Name: string;
  Quantity: number;
  ImageURL: string;
  RawMaterialQuantityType: QuantityType;
}
