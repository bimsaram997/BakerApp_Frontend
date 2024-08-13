import { Pagination } from "../shared/pagination";

export class RecipeRawMaterial {
  rawMaterialId: number;
  rawMaterialQuantity: number;
  measureUnit: number;
  rawMaterialName?: string;
}

export class AddRecipeRequest {
  AddedDate: string | null;
  RecipeName: string;
  Description: string;
  Instructions: string;
  rawMaterials: RecipeRawMaterial[];
}
export class UpdateRecipe {
  RecipeName: string;
  Description: string;
  Instructions: string;
  RawMaterials: RecipeRawMaterial[];
}


export class RecipeVM {
  Id: number;
  RecipeCode: string;
  RecipeName: string;
  AddedDate: string;
  ModifiedDate: string | null;
  IsDeleted: boolean;
  ProductId: number;
  RawMaterials: RecipeRawMaterial[];
  Description: string;
  Instructions: string;
}
export class AllRecipeVM {
  Id: number;
  RecipeCode: string;
  AddedDate: string | null;
  IsDeleted: boolean;
  RecipeName: string;
  Description: string;
  Instructions: string;
  ModifiedDate: string | null;
  RawMaterialDetails: string[];
}

export class PaginatedRecipes {
  Items: AllRecipeVM[];
  TotalCount: number;
  PageIndex: number;
  PageSize: number;
}


export class RecipeListAdvanceFilter {
  SortBy: string;
  IsAscending: boolean;
  Pagination: Pagination;
  SearchString: string | null;
  AddedDate: string | null;
  Description: string | null;
  RawMaterialIds: number[] | null;
}


export class RecipeRawMaterialRequest {
  rawMaterialId: number;
  rawMaterialQuantity: number;
  measureUnit: number;
}
