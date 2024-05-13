import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProductComponent } from './add-food-item/add-product.component';
import { FoodListComponent } from './food-list/food-list.component';


const routes: Routes = [
  { path: 'product', component: FoodListComponent},
  { path: 'add/:mode/:id', component: AddProductComponent },
  { path: 'add/:mode', component: AddProductComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
