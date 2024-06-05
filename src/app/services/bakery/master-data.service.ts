import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddMasterDataRequest, MasterDataListAdvanceFilter, UpdateMasterData } from '../../models/MasterData/MasterData';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  myUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}
  public getMasterData(filter: MasterDataListAdvanceFilter): Observable<any> {
    return this.http.post(`${this.myUrl}/MasterData/listAdvance`, filter);
  }

  public addMasterData(addMasterData: AddMasterDataRequest): Observable<any> {
    return this.http.post(`${this.myUrl}/MasterData/addMasterData`, addMasterData);
  }

  public getMasterDataById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/MasterData/getMasterDataById/${id}`);
  }

  public updateMasterData(masterDataId: number, updateMasterData:UpdateMasterData): Observable<any> {
    return this.http.post(`${this.myUrl}/MasterData/updateMasterDataById/${masterDataId}`, updateMasterData);
  }

  public deleteMasterDataById(id: number): Observable<any> {
    return this.http.delete(`${this.myUrl}/MasterData/deleteMasterDataById/${id}`);
  }

}
