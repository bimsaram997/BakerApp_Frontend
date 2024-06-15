import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';



const routes: Routes = [
  { path: 'supplier', component: SupplierListComponent},
  { path: 'add/:mode/:id', component: AddSupplierComponent },
  { path: 'add/:mode', component: AddSupplierComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
