import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListAdvanceFilter } from '../../models/Products/productListAdvanceFilter';


@Injectable({
  providedIn: 'root'
})
export class FoodTypeService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable()
  }

  public getListSimpleFoodTypes(): Observable<any> {

    return this.http.get(`${this.myUrl}/FoodType/listSimpleFoodTypes`);
  }
}
