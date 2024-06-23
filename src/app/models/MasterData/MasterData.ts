import { Pagination } from "../shared/pagination";

export class MasterDataListAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
  EnumTypeId: number | null;
}

export class AllMasterDataVM {
  Id: number;
  MasterDataCode: string;
  MasterDataName: string;
  EnumTypeId: number;
  MasterDataSymbol: string | null;
  MasterColorCode: string | null;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  EnumType: string;
  MasterValueCode: string;
}

export class PaginateMasterData {
  Items: AllMasterDataVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class AddMasterDataRequest {
  MasterDataName: string;
  EnumTypeId: number
  MasterDataSymbol: string | null;
  MasterColorCode: string | null;
  AddedDate: string;
  MasterValueCode: string
}

export class MasterDataVM {
  Id: number;
  MasterDataCode: string;
  MasterDataName: string;
  EnumTypeId: number;
  MasterDataSymbol: string | null;
  MasterColorCode: string | null;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  MasterValueCode: string
}

export class UpdateMasterData {
  MasterDataName: string;
  EnumTypeId: number;
  MasterDataSymbol: string | null;
  MasterColorCode: string | null;
  MasterValueCode: string
}


export class AllMasterData {
  Items: MasterDataVM[];
}
