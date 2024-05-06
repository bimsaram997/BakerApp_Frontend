import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { AllRawMaterialVM, PaginatedRawMaterials, QuantityType, RawMaterialListAdvanceFilter } from 'src/app/models/RawMaterials/RawMaterial';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-raw-material-list',
  templateUrl: './raw-material-list.component.html',
  styleUrls: ['./raw-material-list.component.css']
})
export class RawMaterialListComponent implements OnInit, OnDestroy {
  header: string = 'Raw materials';
  subscription: Subscription[] = [];
  quantityTypes: any[] = [
    {rawMaterialQuantityType: 0, name: "Kg"}, {rawMaterialQuantityType: 1, name: "L"}
  ]
  searchRawMaterialForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['RawMaterialCode', 'Name','Quantity', 'RawMaterialQuantityType', 'AddedDate', 'ModifiedDate', 'Action'];
  dataSource = new MatTableDataSource<AllRawMaterialVM>();
  QuantityType = QuantityType; // Import the enum
  getQuantityType(value: number): string {
    return QuantityType[value];
  }


  constructor(private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private rawMaterialService:RawMaterialService
  ) {

  }
  ngOnInit() {
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getRawMaterialList();
    this.subscription.push(
      this.toolbarService.buttonClick$.subscribe((buttonType) => {
        if (buttonType) {
          this.handleButtonClick(buttonType);
        }
      })
    );

  }

  searchFormGroup(): void {
    this.searchRawMaterialForm = this.fb.group({
      quantity: [null],
      rawMaterialQuantityType: [null],
      searchString: [null],
      addedDate: [null],
    });
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  public getRawMaterialList(): void {
    const filter: RawMaterialListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Quantity:  this.searchRawMaterialForm.get('quantity').value,
      RawMaterialQuantityType: this.searchRawMaterialForm.get('rawMaterialQuantityType').value,
      SearchString: this.searchRawMaterialForm.get('searchString').value,
      AddedDate: this.searchRawMaterialForm.get('addedDate').value ?? null,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.rawMaterialService.getRawMaterials(filter).subscribe((res: PaginatedRawMaterials) => {
      this.dataSource.data = res.Items;
      this.dataSource.paginator = this.paginator;
      this.paginator.length = res.TotalCount || 0; // Update paginator length
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
        this.paginator.pageIndex = 0; // Reset pageIndex when sorting
        this.getRawMaterialList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getRawMaterialList())
    );
  }


  selectType(value: MatSelectChange): void{
    switch (value.value) {
      case QuantityType.Kg:
        this.quantityType = "Kg";
        break;
      case QuantityType.L:
        this.quantityType = "L";
        break;
      default:
        this.quantityType = "";

    }
  }


  navigateToEditRawMaterial(id: number) {
    this.router.navigate(['base/rawMaterial/add', 'edit', id]);

  }

  private handleNewButton(): void {
    this.router.navigate(['base/rawMaterial/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
    // Add your update logic here
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent("");
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}