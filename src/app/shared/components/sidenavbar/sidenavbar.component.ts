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
    { name: 'Products', icon: 'assets/main images/fast-food.svg', menuType: MenuType.FoodItem },
    { name: 'Raw materials', icon: 'assets/main images/raw-materials.svg', menuType: MenuType.RawMaterial },
    { name: 'Recipe', icon: 'assets/main images/recipe.svg', menuType: MenuType.Recipe },
    { name: 'User', icon: 'assets/main images/user.svg', menuType: MenuType.User }

  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSidenavClose() {
    this.sidenavClose.emit();
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
    }

  }

}
