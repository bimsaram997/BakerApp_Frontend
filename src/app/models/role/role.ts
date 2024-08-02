import { Pagination } from "../shared/pagination";

export class RoleAdvanceFilter {
  Status: number | null;
  RoleDescription: string | null;
  LocationId: number | null;
  SortBy: string;
  IsAscending: boolean;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
}

export class UpdateRole {
  RoleName: string;
  Status: number;
  RoleDescription: string | null;
  LocationId: number;
}


export class AllRolesVM {
  Id: number;
  RoleName: string;
  Status: number;
  StatusName: string | null;
  LocationName: string | null;
  RoleDescription: string | null;
  LocationId: number;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
}

export class PaginatedRoles {
  Items: AllRolesVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}

export class RolesVM {
  Id: number;
  RoleName: string;
  Status: number;
  RoleDescription: string | null;
  LocationId: number;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
}



export class ReturnRoles {
  Items: RolesVM[];
}

