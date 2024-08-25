import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subscription } from 'rxjs';
import { EnumType } from 'src/app/models/enum_collection/enumType';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { AllRawMaterialVM, QuantityType, LocationType, RawMaterialListAdvanceFilter, PaginatedRawMaterials } from 'src/app/models/RawMaterials/RawMaterial';
import { ResultView } from 'src/app/models/ResultView';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { ToolbarService } from 'src/app/services/layout/toolbar.service';

@Component({
  selector: 'app-raw-material-search',
  templateUrl: './raw-material-search.component.html',
  styleUrls: ['./raw-material-search.component.css']
})
export class RawMaterialSearchComponent implements OnInit, OnDestroy {
  header: string = 'Raw materials';
  subscription: Subscription[] = [];
  quantityTypes: MasterDataVM[];
  searchRawMaterialForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'Name',
    'MeasureUnit',
    'Quantity',
    'Price',
    'Location',
    'AddedDate',
    'ModifiedDate',
  ];
  dataSource = new MatTableDataSource<AllRawMaterialVM>();
  QuantityType = QuantityType;
  LocationType = LocationType;
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number;

  selectedItems: any[] = []; // Array to hold selected items
  getQuantityType(value: number): string {
    return QuantityType[value];
  }

  getLocationType(value: number): string {
    return LocationType[value];
  }

  constructor(
    public dialogRef: MatDialogRef<RawMaterialSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private rawMaterialService: RawMaterialService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService

  ) { }

  ngOnInit() {
    console.log(this.data)
    this.getMeasureUnits();
    this.searchFormGroup();
    this.getRawMaterialList();
   // this.selectedItems = this.data.existingItems || [];
  }

  // isSelected(id: string): boolean {
  //   this.id = +id;
  //   return this.selectedId === id;
  // }

  public getMeasureUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(
        EnumType.MeasuringUnit
      );
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error.Message);
              return error;
            })
          )
          .subscribe((res: ResultView<AllMasterData>) => {
            if (res != null) {
              this.quantityTypes = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error(
        'An error occurred while attempting to load master data:',
        error
      );
    }
  }

  searchFormGroup(): void {
    this.searchRawMaterialForm = this.fb.group({
      quantity: [null],
      measureUnit: [null],
      searchString: [null],
      addedDate: [null],
    });
  }

  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        this.handleUpdateButton();
        break;
      case ToolbarButtonType.Edit:
        this.navigateToEditRawMaterial(this.id);
        break;
      case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  public getRawMaterialList(isSearch?: boolean): void {
    this.dataSource.data = null;
    const filter: RawMaterialListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Quantity: this.searchRawMaterialForm.get('quantity').value,
      MeasureUnit: this.searchRawMaterialForm.get('measureUnit').value,
      SearchString: this.searchRawMaterialForm.get('searchString').value,
      AddedDate: this.searchRawMaterialForm.get('addedDate').value ?? null,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.rawMaterialService
      .getRawMaterials(filter)
      .subscribe((res: ResultView<PaginatedRawMaterials>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0;
        this.dataSource.sort = this.sort;
        if(!isSearch) {
          this.markExistingItemsAsSelected();
        }

      });
  }

  search(): void {
    const isSearch: boolean  = true;
    this.getRawMaterialList(true);
  }

  clear(): void {
    this.searchRawMaterialForm.reset();
    this.getRawMaterialList();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.getRawMaterialList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getRawMaterialList())
    );
  }

  selectType(value: MatSelectChange): void {
    switch (value.value) {
      case QuantityType.Kg:
        this.quantityType = 'Kg';
        break;
      case QuantityType.L:
        this.quantityType = 'L';
        break;
      default:
        this.quantityType = '';
    }
  }

  navigateToEditRawMaterial(id: number) {
    this.router.navigate(['base/rawMaterial/add', 'view', id]);
  }

  private handleNewButton(): void {
    this.router.navigate(['base/rawMaterial/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
  }

  // checkboxChanged(event: MatCheckboxChange, id: string): void {

  //   if (event.checked && this.selectedId === id) {
  //     this.selectedId = null;
  //     this.id = null;
  //   } else {
  //     this.selectedId = id;
  //     this.id = +id;
  //   }
  // }


  markExistingItemsAsSelected(): void {
    this.dataSource.data.forEach((item: AllRawMaterialVM) => {
      if (this.data.existingItems.some(existingItem => existingItem.id === item.Id)) {
        this.selectedItems.push({
          id: item.Id,
          MeasureUnit: item.MeasureUnit,
          Quantity: item.Quantity
        });
      }
    });
  }

  checkboxChanged(event: MatCheckboxChange, element: any): void {
    if (event.checked) {
      // Add selected item to the array
      this.selectedItems.push({
        id: element.Id,
        MeasureUnit: element.MeasureUnit,
        Quantity: element.Quantity
      });
    } else {
      // Ensure the data type matches (e.g., converting id to a string)
      this.selectedItems = this.selectedItems.filter(item => item.id !== element.Id);
    }
    console.log(this.selectedItems);
  }
  isSelected(id: string): boolean {
    return this.selectedItems.some(item => item.id === id);
  }
  ngOnDestroy(): void {

    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  get dialogTitle(): string {
    return this.data.title || 'Dialog Title';
  }

  get dialogText(): string {
    return this.data.text || 'Dialog Text';
  }


  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(this.selectedItems);
  }

}
