import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListAdvanceFilter } from '../../models/FoodItems/productListAdvanceFilter';


@Injectable({
  providedIn: 'root'
})
export class FoodItemsService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable()
  }

  public getFoodItems(filter: ProductListAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/FoodItem/listAdvance`, filter);
  }
}
