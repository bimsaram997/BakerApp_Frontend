import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, catchError } from 'rxjs';
import { EnumTranslationService } from '../../../services/bakery/enum-translation.service';
import {
  AllEnumTypeVM,
  PaginateEnumTypeData,
} from '../../../models/enum_collection/enumType';
import {
  AddMasterDataRequest,
  MasterDataVM,
  UpdateMasterData,
} from '../../../models/MasterData/MasterData';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
@Component({
  selector: 'app-add-master-data',
  templateUrl: './add-master-data.component.html',
  styleUrls: ['./add-master-data.component.css'],
})
export class AddMasterDataComponent implements OnInit, OnDestroy {
  masterDataGroup: FormGroup;
  subscription: Subscription[] = [];
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  isSave: boolean = false;
  updateMasterData: UpdateMasterData = new UpdateMasterData();
  constructor(
    public dialogRef: MatDialogRef<AddMasterDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private enumTranslationService: EnumTranslationService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.createFormGroup();
    this.loadEnumTypeData();
    if (this.data.edit && this.data.id != null) {
      this.isEdit = this.data.edit;
      this.getMasterDataById(+this.data.id);
    }
  }

  createFormGroup(): void {
    this.masterDataGroup = this.fb.group({
      masterDataName: [null, Validators.required],
      enumTypeId: [null, Validators.required],
      masterDataSymbol: [null],
      masterColorCode: [null],
      addedDate: [null, Validators.required],
    });
  }

  getMasterDataById(id: number): void {
    if (id > 0) {
      try {
        const resultResponse = this.masterDataService.getMasterDataById(id);
        this.subscription.push(
          resultResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                return error;
              })
            )
            .subscribe((masterData: ResultView<MasterDataVM>) => {
              if (masterData != null) {
                this.setValuestoForm(masterData.Item);
              }
            })
        );
      } catch (error) {
        console.error('An error occurred while attempting to log in:', error);
      }
    }
  }

  setValuestoForm(masterData: MasterDataVM): void {
    if (masterData != null) {
      this.masterDataGroup.controls['masterDataName'].setValue(
        masterData.MasterDataName
      );
      this.masterDataGroup.controls['enumTypeId'].setValue(
        masterData.EnumTypeId
      );
      this.masterDataGroup.controls['masterDataSymbol'].setValue(
        masterData.MasterDataSymbol
      );
      this.masterDataGroup.controls['masterColorCode'].setValue(
        masterData.MasterColorCode
      );
      this.masterDataGroup.controls['addedDate'].setValue(masterData.AddedDate);
    }
  }

  loadEnumTypeData(): void {
    this.subscription.push(
      this.enumTranslationService
        .getEnumData()
        .subscribe((res: PaginateEnumTypeData) => {
          this.enumDataList = res.Items;
        })
    );
  }
  click(): void {
    if (this.data.edit) {
      this.updateMasterDatas();
    } else {
      this.addMasterData();
    }
  }

  addMasterData(): void {
    Object.values(this.masterDataGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.masterDataGroup.valid) {
      try {
        this.isSave = true;
        const formData = this.masterDataGroup.value;
        const addMasterData: AddMasterDataRequest = {
          MasterDataName: formData.masterDataName,
          MasterColorCode: formData.masterColorCode,
          MasterDataSymbol: formData.masterDataSymbol,
          EnumTypeId: formData.enumTypeId,
          AddedDate: formData.addedDate,
        };

        const addReponse = this.masterDataService.addMasterData(addMasterData);
        this.subscription.push(
          addReponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);

                return error;
              })
            )
            .subscribe((res: AddResultVM) => {
              if (res != null) {
                this.isSave = false;
                this.toastr.success('Success!', 'Master data addeed!');
                this.dialogRef.close(true);

              }
            })
        );
      } catch (error) {
        this.isSave = false;
        this.dialogRef.close(false);
        console.error('An error occurred while Master data  adding:', error);
        this.toastr.error('Error!', 'Failed to add master data.');
      }
    }
  }

  updateMasterDatas(): void {
    Object.values(this.masterDataGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    try {
      if (this.masterDataGroup.valid) {
        this.isSave = true;
        this.updateMasterData.EnumTypeId =
          this.masterDataGroup.controls['enumTypeId'].value;
        this.updateMasterData.MasterDataName =
          this.masterDataGroup.controls['masterDataName'].value;
        this.updateMasterData.MasterDataSymbol =
          this.masterDataGroup.controls['masterDataSymbol'].value;
        this.updateMasterData.MasterColorCode =
          this.masterDataGroup.controls['masterColorCode'].value;
          const updateResponse = this.masterDataService.updateMasterData(
            this.data.id, this.updateMasterData
          );

          this.subscription.push(
            updateResponse
              .pipe(
                catchError((error) => {
                  this.toastr.error('Error!', error.error.Message);
                  return error;
                })
              )
              .subscribe((res: AddResultVM) => {
                if (res != null) {
                  this.toastr.success('Success!', 'Master data updated!');
                  this.isSave = false;
                  this.dialogRef.close(true);
                }
              })
          );
      }
    } catch (e) {
      this.toastr.error('Error!', 'Failed to update master data');
      this.isSave = false;
      this.dialogRef.close(false);
    }
  }
  ngOnDestroy(): void {
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
