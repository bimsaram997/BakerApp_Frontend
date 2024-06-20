import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddSupplierRquest, SupplierListAdvanceFilter, UpdateSupplier } from 'src/app/models/Supplier/Supplier';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  myUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}
  public addSupplier(addSupplier: AddSupplierRquest): Observable<any> {
    return this.http.post(`${this.myUrl}/Supplier/addSupplier`, addSupplier);
  }

  public getSuppliers(filter: SupplierListAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/Supplier/listAdvance`, filter);
  }

  public getSupplierById(supplierId: number): Observable<any> {
    return this.http.get(`${this.myUrl}/Supplier/getSupplierById/${supplierId}`);
  }

  public updateSupplierById(supplierId: number, updateItem: UpdateSupplier): Observable<any> {
    return this.http.put(`${this.myUrl}/Supplier/updateSupplier/${supplierId}`, updateItem)
  }
}
