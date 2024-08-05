import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleAdvanceFilter, UpdateRole } from 'src/app/models/role/role';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {

  }

  public getRoles(filter: RoleAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/Roles/listAdvance`, filter);
  }

  public getRoleById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/Roles/getRoleById/${id}`);
  }

  public updateRoleById(roleId: number, updateItem: UpdateRole): Observable<any> {
    return this.http.post(`${this.myUrl}/Roles/updateRoleById/${roleId}`, updateItem)
  }

  public listSimpleRoles(): Observable<any> {
    return this.http.get(`${this.myUrl}/Roles/listSimpleRole`);
  }
}
