import { Addresses, AddressRequest } from "../Address/Address";
import { Pagination } from "../shared/pagination";

export class AllLocationVM {
  Id: number;
  LocationCode: string;
  LocationName: string;
  AddedDate: string;
  AddressId: number;
  IsDeleted: boolean;
  ModifiedDate: string | null;
  Status: number;
  StatusName: string;
  Addresses: Addresses;
}

export class LocationAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
  Status: number | null;
}

export class PaginatedLocationData {
  Items: AllLocationVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class AddLocationRequest {
  LocationName: string;
  AddedDate: string;
  Address: AddressRequest;
  Status: number;
}

export class UpdateLocation {
  LocationName: string;
  Status: number;
  AddressId: number;
  Address: AddressRequest;
}

export class LocationVM {
  Id: number;
  LocationCode: string;
  LocationName: string;
  AddedDate: string;
  AddressId: number;
  IsDeleted: boolean;
  ModifiedDate: string | null;
  Status: number;
  Address: Addresses | null;
}

export class LocationlListSimpleVM {
  Id: number;
  LocationName: string;
}

export class AllLocationListSimple {
  Items: LocationlListSimpleVM[]
}
