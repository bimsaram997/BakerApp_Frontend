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
