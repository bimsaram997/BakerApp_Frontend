export class AllEnumTypeVM {
  Id: number;
  EnumTypeName: string;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  EnumTypeDisplayValue: string;
}
export class PaginateEnumTypeData {
  Items: AllEnumTypeVM[];

}


export enum EnumType {
  Currency = 1,
  MeasuringUnit = 6,
  ItemUnit = 7,
  Gender = 5,
  Roles = 1,
  Countries = 3,
  CostCodes =13,
  SupplyingType = 14,
  Status = 2,
}

export enum AutoCompleteType {
  RawMaterial = 1,
  Product = 2,
}

export enum SearchItemType {
  RawMaterial = 1,
  Product = 2,
}

