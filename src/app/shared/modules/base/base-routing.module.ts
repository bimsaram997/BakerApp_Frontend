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
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BaseRoutingModule { }
