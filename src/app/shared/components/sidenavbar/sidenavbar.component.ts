import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuType } from '../../../models/enum_collection/menu-type';
import { Menu } from '../../../models/shared/menu';

@Component({
  selector: 'app-sidenavbar',
  templateUrl: './sidenavbar.component.html',
  styleUrls: ['./sidenavbar.component.css']
})
export class SidenavbarComponent {
  @Output() sidenavClose = new EventEmitter();
  imagePath: string = 'assets/main images/bread-food-meal-bun.jpg';
  menuArray: Menu[] = [
    { name: 'Products', icon: 'assets/main images/fast-food.svg', menuType: MenuType.FoodItem, visible: true },
    { name: 'Raw materials', icon: 'assets/main images/raw-materials.svg', menuType: MenuType.RawMaterial, visible: true },
    { name: 'Recipe', icon: 'assets/main images/recipe.svg', menuType: MenuType.Recipe, visible: true },
    { name: 'User', icon: 'assets/main images/user.svg', menuType: MenuType.User, visible: true },
    {
      name: 'Global Settings',
      icon: 'assets/main images/settings.svg',
      menuType: MenuType.Settings,
      visible: true,
      subItems: [
        { name: 'Master data', icon: 'assets/main images/fast-food.svg', menuType: MenuType.MasterData, visible: true },
        { name: 'Suppliers', icon: 'assets/main images/fast-food.svg', menuType: MenuType.Supplier, visible: true },
        { name: 'Stock', icon: 'assets/main images/fast-food.svg', menuType: MenuType.Stock, visible: true },
        // { name: 'Sub Setting 2', icon: 'assets/main images/fast-food.svg', menuType: MenuType.SubSetting2, visible: true }
      ]
    }
  ];
  isShow: boolean =  false;
  expandedMenu: Menu | null = null;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSidenavClose() {
    this.sidenavClose.emit();
  }

  expand(subMenus?:Menu[]): void {
   this.isShow = !this.isShow;
  }

  navigateTo(menuype: MenuType) {

    switch (menuype) {
      case MenuType.FoodItem:
        this.router.navigate(['base/product/product']);
        break;
      case MenuType.RawMaterial:
        this.router.navigate(['base/rawMaterial/rawMaterial']);
        break;
      case MenuType.Recipe:
        this.router.navigate(['base/recipe/recipe']);
        break;
      case MenuType.User:
          this.router.navigate(['base/user/user']);
          break;
      case MenuType.MasterData:
        this.router.navigate(['base/masterData/masterData']);
          break;
      case MenuType.Supplier:
        this.router.navigate(['base/supplier/supplier']);
        break;
      case MenuType.Stock:
        this.router.navigate(['base/stock/stock']);
    }

  }

}
