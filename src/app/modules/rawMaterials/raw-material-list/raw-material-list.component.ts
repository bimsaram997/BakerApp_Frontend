import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import {
  AllRawMaterialVM,
  LocationType,
  PaginatedRawMaterials,
  QuantityType,
  RawMaterialListAdvanceFilter,
} from 'src/app/models/RawMaterials/RawMaterial';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { EnumType } from '../../../models/enum_collection/enumType';
import {
  AllMasterData,
  MasterDataVM,
} from '../../../models/MasterData/MasterData';
import { ResultView } from 'src/app/models/ResultView';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-raw-material-list',
  templateUrl: './raw-material-list.component.html',
  styleUrls: ['./raw-material-list.component.css'],
})
export class RawMaterialListComponent implements OnInit, OnDestroy {
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
  getQuantityType(value: number): string {
    return QuantityType[value];
  }

  getLocationType(value: number): string {
    return LocationType[value];
  }

  constructor(
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private rawMaterialService: RawMaterialService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.getMeasureUnits();
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.getRawMaterialList();
  }

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }

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

  public getRawMaterialList(): void {
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
      });
  }

  search(): void {
    this.getRawMaterialList();
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

  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      const hasEditButton = this.toolBarButtons.includes(
        ToolbarButtonType.Edit
      );
      const hasDeleteButton = this.toolBarButtons.includes(
        ToolbarButtonType.Delete
      );
      if (!hasEditButton) {
        this.toolBarButtons.push(ToolbarButtonType.Edit);
      }
      if (!hasDeleteButton) {
        this.toolBarButtons.push(ToolbarButtonType.Delete);
      }

      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.removeSpecificButtons();
    }
    if (this.selectedId === id) {
      this.selectedId = null;
      this.id = null;
    } else {
      this.selectedId = id;
      this.id = +id;
      console.log(this.selectedId);
    }
  }

  removeSpecificButtons(): void {
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Delete);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    const editIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (editIndex !== -1) {
      this.toolBarButtons.splice(editIndex, 1);
    }
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
