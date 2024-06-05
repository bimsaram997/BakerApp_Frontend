export class RolesVM {
  Id: number;
  RoleName: string;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
}

export class ReturnRoles {
  Items: RolesVM[];
}
