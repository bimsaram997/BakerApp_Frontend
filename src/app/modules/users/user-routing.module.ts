import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add-user/add-user.component';



const routes: Routes = [
  { path: 'user', component: UserListComponent},
  { path: 'add/:mode/:id', component: AddUserComponent },
  { path: 'add/:mode', component: AddUserComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
