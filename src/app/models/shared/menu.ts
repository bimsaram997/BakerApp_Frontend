import { SafeHtml } from "@angular/platform-browser";
import { MenuType } from "../enum_collection/menu-type";
import { AutoCompleteType } from "../enum_collection/enumType";

export class Menu{
  name: string;
  icon: string;
  menuType: MenuType;
  visible?: boolean;
  subItems?: Menu[];
}


export class AutoCompleteResult {
  idList: number [];
  type: AutoCompleteType;
}
