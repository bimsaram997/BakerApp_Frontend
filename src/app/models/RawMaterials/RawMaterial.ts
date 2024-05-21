import { Pagination } from "../shared/pagination";

export enum QuantityType {
  Kg =0,
  L = 1
}


export enum LocationType {
  Matara =0,
  Colombo = 1
}

export class AddRawMaterial {
  Name: string;
  Quantity: number;
  AddedDate: string | null;
  ImageURL: string;
  MeasureUnit: QuantityType;
  Price: number;
  LocationId: number;
}

export class RawMaterialVM {
  Id: number;
  RawMaterialCode: string;
  Name: string;
  Quantity: number;
  AddedDate: string | null;
  ImageURL: string;
  MeasureUnit: QuantityType;
  IsDeleted: boolean;
  ModifiedDate: string | null;
  Price: number;
  LocationId: number;
}


export class AllRawMaterialVM {
  Id: number;
  Name: string;
  AddedDate: string | null;
  MeasureUnit:  QuantityType;
  Quantity: number | null;
  ImageURL: string;
  ModifiedDate: string | null;
  RawMaterialCode: string | null;
  Location: string | null;
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
  MeasureUnit: QuantityType | null;
  Pagination: Pagination;
  SortBy: string;
  IsAscending: boolean;
}


export class UpdateRawMaterial {
  Name: string;
  Quantity: number;
  ImageURL: string;
  MeasureUnit: QuantityType;
  Price: number;
  LocationId: number;
}


export class RawMaterialListSimpleVM {
  Id: number;
  Name: string;
  Quantity: number;
  MeasureUnit: QuantityType;
}
