import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterDataListComponent } from './master-data-list/master-data-list.component';



const routes: Routes = [
  { path: 'masterData', component: MasterDataListComponent},
  // { path: 'add/:mode/:id', component: AddProductComponent },
  // { path: 'add/:mode', component: AddProductComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
