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
  MeasuringUnit = 2,
  ItemUnit = 8,
  Gender = 9,
  Roles = 11,
  Countries = 12,
  CostCodes =13,
  SupplyingType = 14,
  Status = 15,
}

export enum AutoCompleteType {
  RawMaterial = 1,
  Product = 2,
}

export enum SearchItemType {
  RawMaterial = 1,
  Product = 2,
}

