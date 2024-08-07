import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './base.component';

const routes: Routes = [
  {path: '', component:BaseComponent,
    children: [
      {
        path:'',
        loadChildren: () => import('../home-dashboard/home-dashboard.module').then(m => m.HomeDashboardModule)
      },
      {
        path:'product',
        loadChildren: () => import('../../../modules/products/products.module').then(m => m.ProductsModule)
      },
      {
        path:'rawMaterial',
        loadChildren: () => import('../../../modules/rawMaterials/rawMaterials.module').then(m => m.RawMaterialModule)
      },
      {
        path:'recipe',
        loadChildren: () => import('../../../modules/recipe/recipe.module').then(m => m.RecipeModule)
      },
      {
        path:'user',
        loadChildren: () => import('../../../modules/users/user.module').then(m => m.UserModule)
      },
      {
        path:'masterData',
        loadChildren: () => import('../../../modules/masterData/masterData.module').then(m => m.MasterDataModule)
      },
      {
        path:'supplier',
        loadChildren: () => import('../../../modules/supplier/supplier.module').then(m => m.SupplierModule)
      },
      {
        path:'stock',
        loadChildren: () => import('../../../modules/stock/stock.module').then(m => m.StockModule)
      },
      {
        path:'location',
        loadChildren: () => import('../../../modules/location/location.module').then(m => m.LocationModule)
      },
      {
        path:'role',
        loadChildren: () => import('../../../modules/roles/role.module').then(m => m.RoleModule)
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BaseRoutingModule { }
