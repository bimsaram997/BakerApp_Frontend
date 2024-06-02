export class AddressRequest {
  Street1: string;
  Street2: string;
  City: string;
  Country: number;
  PostalCode: number;
}

export class Addresses {
  Id: number;
  FullAddress: string;
  Street1: string;
  Street2: string;
  City: string;
  Country: number;
  PostalCode: number;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
}


export class UserDetailVM {
  Id: number;
  UserCode: string;
  AddedDate: string;
  ModifiedDate: string | null;
  FirstName: string;
  LastName: string;
  AddressId: number;
  PhoneNumber: string;
  Role: number;
  Email: string;
  ImageUrl: string;
  Address: Addresses;
  Gender: number;
}
