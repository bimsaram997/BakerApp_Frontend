import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../../models/Authorization/Authorization';
import { AdduserRequest, UpdateUser, UserAdvanceListFilter } from '../../models/User/User';
@Injectable({
  providedIn: 'root',
})
export class LoginServiceService {
  myUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  public login(login: LoginRequest): Observable<any> {
    return this.http.post(`${this.myUrl}/User/login`, login);
  }
  public register(addUser: AdduserRequest): Observable<any> {
    return this.http.post(`${this.myUrl}/User/register`, addUser);
  }
  public getUsers(filter: UserAdvanceListFilter): Observable<any> {
    return this.http.post(`${this.myUrl}/User/listAdvance`, filter);
  }

  public getUserId(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/User/getUserById/${id}`);
  }

  public updateUserById(userId: number, updateItem: UpdateUser): Observable<any> {
    return this.http.put(`${this.myUrl}/User/updateUser/${userId}`, updateItem)
  }

}
