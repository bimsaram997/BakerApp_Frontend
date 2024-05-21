import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductListComponent } from './product/product-list.component';


const routes: Routes = [
  { path: 'product', component: ProductListComponent},
  { path: 'add/:mode/:id', component: AddProductComponent },
  { path: 'add/:mode', component: AddProductComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
