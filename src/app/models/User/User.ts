import { AddressRequest, Addresses } from "../Address/Address";
import { Pagination } from "../shared/pagination";

export class AdduserRequest {
  AddedDate: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Role: string;
  Email: string;
  Password: string;
  ImageUrl: string;
  Address: AddressRequest;
  Gender: number;
}

export class AllUserVM {
  Id: number;
  UserCode: string;
  AddedDate: string;
  ModifiedDate: string | null;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Role: number;
  Email: string;
  ImageUrl: string;
  Gender: number;
  IsDeleted: boolean;
  AddressId: number;
  Addresses: Addresses;
}

export class UserAdvanceListFilter {
  AddedDate: string;
  PhoneNumber: string;
  Role: number;
  Email: string;
  Gender: number;
  SortBy: string;
  IsAscending: boolean;
  SearchString: string | null;
  Pagination: Pagination;
}

export class PaginatedUsers {
  Items: AllUserVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class UpdateUser {
  FirstName: string;
  LastName: string;
  AddressId: number;
  PhoneNumber: string;
  Role: number;
  Gender: number;
  Email: string;
  ImageUrl: string;
  Address: AddressRequest;
}
