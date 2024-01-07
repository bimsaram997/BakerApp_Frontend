import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';
import { FoodListComponent } from './food-list/food-list.component';


const routes: Routes = [{ path: '', component: FoodListComponent }, { path: 'addFoodItem', component: AddFoodItemComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
