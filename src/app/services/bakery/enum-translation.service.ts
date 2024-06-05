import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnumTranslationService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {

  }
  public getEnumData(): Observable<any> {

    return this.http.get(`${this.myUrl}/EnumType/listAdvance`);
}
  }
