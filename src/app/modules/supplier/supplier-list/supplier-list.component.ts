import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Router } from '@angular/router';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { SupplierService } from 'src/app/services/bakery/supplier.service';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { ProductService } from '../../../services/bakery/product.service';
import { RawMaterialListSimpleVM } from 'src/app/models/RawMaterials/RawMaterial';
import { ProductListSimpleVM } from 'src/app/models/Products/product';
import { SearchItemType } from 'src/app/models/enum_collection/enumType';
import { ResultView } from 'src/app/models/ResultView';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AllSupplierVM, PaginatedSuppliers, SupplierListAdvanceFilter } from 'src/app/models/Supplier/Supplier';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy  {
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('rawMaterialInput') rawMaterialInput: ElementRef<HTMLInputElement>;
  header: string = 'Suppliers';
  subscription: Subscription[] = [];
  searchSupplierForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'SupplierFirstName',
    'SupplierLastName',
    'AddedDate',
    'PhoneNumber',
    'Email',
    'Address',
    'ModifiedDate',
    'SupplierType',
    'ProductIds',
    'RawMaterialIds',
  ];
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number;
  allRawMaterials: RawMaterialListSimpleVM[];
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;

  productSearchCtrl = new FormControl();
  rawMaterialSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  isRawMaterial: boolean = null;
  dataSource = new MatTableDataSource<AllSupplierVM>();
  constructor(
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private supplierService: SupplierService,
    private rawMaterialService: RawMaterialService,
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.searchFormGroup();
    this.getListRawMaterials();
    this.getListProducts();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getSupplierList();
    this.subscription.push(
      this.productSearchCtrl.valueChanges.subscribe((value: any) => {
        if (value != '') {
          this._filterItems(value, SearchItemType.Product);
        }
      })
    );
    this.subscription.push(
      this.rawMaterialSearchCtrl.valueChanges.subscribe((value: any) => {
        if (value != '') {
          this._filterItems(value, SearchItemType.RawMaterial);
        }
      })
    );

  }

  searchFormGroup(): void {
    this.searchSupplierForm = this.fb.group({
      Email: [null],
      phoneNumber: [null],
      searchString: [null],
      addedDate: [null],
      productIds: [null],
      rawMaterialIds: [null],
      supplierItemType: [null],
      email:[null]
    });
  }

  public getSupplierList(): void {
    this.dataSource.data = null;
    const filter: SupplierListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Email: this.searchSupplierForm.get('email').value,
      RawMaterialIds: this.searchSupplierForm.get('rawMaterialIds').value,
      SearchString: this.searchSupplierForm.get('searchString').value,
      AddedDate: this.searchSupplierForm.get('addedDate').value ?? null,
      ProductIds: this.searchSupplierForm.get('productIds').value,
      PhoneNumber: this.searchSupplierForm.get('phoneNumber').value,
      IsRawMaterial: this.isRawMaterial,
      IsProduct: this.isProduct,
      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.supplierService
      .getSuppliers(filter)
      .subscribe((res:  ResultView<PaginatedSuppliers>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0;
        this.dataSource.sort = this.sort;
      });
  }

  search(): void {
    this.getSupplierList();
  }

  clear(): void {
    this.isProduct =  null;
    this.isRawMaterial = null;
    this.searchSupplierForm.reset();
    this.getSupplierList();

  }


  getListRawMaterials(): void {
    this.rawMaterialService
      .listSimpleRawmaterials()
      .subscribe((res: ResultView<RawMaterialListSimpleVM[]>) => {
        this.allRawMaterials = res.Item;
        this.staticRawterials = this.allRawMaterials;
      });
  }

  getListProducts(): void {
    this.productService
      .listSimpleProducts()
      .subscribe((res: ResultView<ProductListSimpleVM[]>) => {
        this.allProdcuts = res.Item;
        this.staticProductList = this.allProdcuts;
      });
  }


  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.Edit:
        this.navigateToEditSupplier(this.id);
        break;
      case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
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

  private _filterItems(value: string, searchItemType: SearchItemType): void {
    switch (searchItemType) {
      case SearchItemType.Product:
        if (value !== null) {
          const filterValue = value;
          const test = this.allProdcuts.filter((product) =>
            product.Name.includes(filterValue)
          );
          if (test) {
            this.allProdcuts = test;
          }
        }
        break;
      case SearchItemType.RawMaterial:
        if (value !== null) {
          const filterValue = value;
          const test = this.allRawMaterials.filter((rawMaterial) =>
            rawMaterial.Name.includes(filterValue)
          );
          if (test) {
            this.allRawMaterials = test;
          }
        }
    }

  }

  onInputValueChanged(searchItemType: SearchItemType) {
    switch (searchItemType) {
      case SearchItemType.Product:
        if (
          this.productSearchCtrl &&
          this.productInput.nativeElement.value.trim() === ''
        ) {
          this.allProdcuts = this.staticProductList;
        }
        break;
      case SearchItemType.RawMaterial:
        if (
          this.rawMaterialSearchCtrl &&
          this.rawMaterialInput.nativeElement.value.trim() === ''
        ) {
          this.allRawMaterials = this.staticRawterials;
        }
        break;
    }
  }



selectValue($event: any): void {
  const isSelect = $event.value;
  if (isSelect) {
    this.isProduct = true;
    this.isRawMaterial = false;

  } else {
    this.isProduct = false;
    this.isRawMaterial = true;

  }
}


  navigateToEditSupplier(id: number) {
    this.router.navigate(['base/supplier/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/supplier/add', 'add']);
  }

  getType(IsRawMaterial: boolean, IsProduct: boolean): string {
    if(IsRawMaterial) {
      return 'Raw material supplier';
    } else if (IsProduct) {
      return 'Product supplier';
    }
    else {
      return '';
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.getSupplierList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getSupplierList())
    );
  }


  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.toolbarService.unsubscribeAll();
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

}
