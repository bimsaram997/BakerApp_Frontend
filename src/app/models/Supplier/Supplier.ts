import { Addresses, AddressRequest } from "../Address/Address";
import { Pagination } from "../shared/pagination";

export class AddSupplierRquest {
  SupplierFirstName: string;
  SupplierLastName: string;
  AddedDate: string;
  PhoneNumber: string;
  Email: string;
  IsRawMaterial: boolean | null;
  IsProduct: boolean | null;
  Address: AddressRequest;
  ProductIds: number[];
  RawMaterialIds: number[];
}

export class SupplierListAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
  Email: string | null;
  PhoneNumber: string | null;
  IsRawMaterial: boolean | null;
  IsProduct: boolean | null;
  RawMaterialIds: number[] | null;
  ProductIds: number[] | null;
}

export class AllSupplierVM {
  Id: number;
  SupplierCode: string;
  SupplierFirstName: string;
  SupplierLastName: string;
  AddedDate: string;
  ModifiedDate: string | null;
  PhoneNumber: string;
  Email: string;
  IsRawMaterial: boolean | null;
  IsProduct: boolean | null;
  IsDeleted: boolean;
  AddressId: number;
  Addresses: Addresses;
  RawMaterialDetails: string[];
  ProductDetails: string[];
}

export class PaginatedSuppliers {
  Items: AllSupplierVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class SupplierVM {
  Id: number;
  SupplierCode: string;
  SupplierFirstName: string;
  SupplierLastName: string;
  AddedDate: string;
  ModifiedDate: string | null;
  PhoneNumber: string;
  Email: string;
  IsRawMaterial: boolean | null;
  IsProduct: boolean | null;
  IsDeleted: boolean;
  AddressId: number;
  ProductIds: (number | null)[];
  RawMaterialIds: (number | null)[];
  Address: Addresses | null;
}

export class UpdateSupplier {
  SupplierFirstName: string;
  SupplierLastName: string;
  PhoneNumber: string;
  Email: string;
  AddressId: number;
  IsRawMaterial: boolean | null;
  IsProduct: boolean | null;
  Address: AddressRequest;
  ProductIds: number[] | null;
  RawMaterialIds: number[] | null;
}
