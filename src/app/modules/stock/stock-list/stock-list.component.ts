import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { catchError, Subscription } from 'rxjs';
import { EnumType, SearchItemType } from '../../../models/enum_collection/enumType'
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ProductListSimpleVM, RecipeListSimpleVM } from '../../../models/Products/product';
import { RawMaterialListSimpleVM } from '../../../models/RawMaterials/RawMaterial';
import { ToastrService } from 'ngx-toastr';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { Router } from '@angular/router';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ProductService } from '../../../services/bakery/product.service';
import { ResultView } from 'src/app/models/ResultView';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { RecipeService } from 'src/app/services/bakery/reipe.service';
import { MatSelectChange } from '@angular/material/select';
import { MasterDataCode } from 'src/app/models/enum_collection/masterDataCode';
import { SupplerListSimpleFilter, SupplierListSimpleVM } from 'src/app/models/Supplier/Supplier';
import { SupplierService } from 'src/app/services/bakery/supplier.service';
import { AllStockVM, PaginatedStocks, StockListAdvanceFilter } from 'src/app/models/Stock/Stock';
import { MatTableDataSource } from '@angular/material/table';
import { StockServiceService } from 'src/app/services/bakery/stock-service.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent {
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  subscription: Subscription[] = [];
  searchStockForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'StockCode',
    'ProductName',
    'BatchId',
    'MeasureUnitName',
    'CostCode',
    'CostPrice',
    'SellingPrice',
    'RecipeName',
    'SupplyTypeId',
    'SupplierName',
    'ManufacturedDate',
    'ExpiredDate',
    'ItemQuantity',
    'ReorderLevel',
  ];
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number;
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;
  productSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  isRawMaterial: boolean = null;
  header: string = 'Stock';
  itemCount: FormControl<number>;
  sellingPrice: FormControl<any>;
  costPrice: FormControl<any>;
  reorderLevel: FormControl<any>;
  units: MasterDataVM[];
  recipes: RecipeListSimpleVM[] = [];
  supplyingTypes: MasterDataVM[];
  isExternalSupplier: boolean;
  supplierList: SupplierListSimpleVM[] = [];
  showAdvancedFilters = false;
  costCodes: MasterDataVM[];
  dataSource = new MatTableDataSource<AllStockVM>();
  constructor(
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private productService: ProductService,
    private recipeService: RecipeService,
    private supplierService: SupplierService,
    private stockServiceService: StockServiceService
  ) {}

  ngOnInit() {
   this.searchFormGroup();
    //this.getListRawMaterials();
   this.getListProducts();
   this.getUnits();
   this.getListSimpleRecipes();
   this.getSuppliers();
   this.getSupplyingType();
   this.getCostCodes();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getStocks();
    this.subscription.push(
      this.productSearchCtrl.valueChanges.subscribe((value: any) => {
        if (value != '') {
          this._filterItems(value, SearchItemType.Product);
        }
      })
    );

  }

  searchFormGroup(): void {
    this.searchStockForm = this.fb.group({
      product: [null],
      unit: [null],
      costCode: [null],
      recipeId: [null],
      rawMaterialIds:[null],
      supplyingType: [null],
      supplierId: [null],
      addedDate: [null],
      manufactureDate: [null],
      expiryDate: [null],
      searchString: [null]
    });
    this.itemCount = new FormControl(null);
    this.reorderLevel = new FormControl(null);
    this.sellingPrice = new FormControl(null);
    this.costPrice =  new FormControl(null);
  }

  public getStocks(): void {
    this.dataSource.data = null;
    const filter: StockListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      ProductId: this.searchStockForm.get('product').value,
      Unit: this.searchStockForm.get('unit').value,
      SearchString: this.searchStockForm.get('searchString').value,
      AddedDate: this.searchStockForm.get('addedDate').value ?? null,
      CostCode: this.searchStockForm.get('costCode').value,
      RecipeId: this.searchStockForm.get('recipeId').value,
      SupplyTypeId: this.searchStockForm.get('supplyingType').value,
      SupplierId: this.searchStockForm.get('supplierId').value,
      ManufacturedDate: this.searchStockForm.get('manufactureDate').value,
      ExpiredDate: this.searchStockForm.get('expiryDate').value,
      ItemQuantity: this.itemCount.value,
      ReorderLevel: this.reorderLevel.value,
      SellingPrice: this.sellingPrice.value,
      CostPrice: this.costPrice.value,
      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.stockServiceService
      .getStock(filter)
      .subscribe((res:  ResultView<PaginatedStocks>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0;
        this.dataSource.sort = this.sort;
      });
  }


  selectSupplierType(value: MatSelectChange): void {
    const Id = value.value;
    this.searchStockForm.controls['supplierId'].setValue(null);
    const supplierCode  = this.supplyingTypes.find((suppliertype: MasterDataVM) => suppliertype.Id === Id).MasterValueCode;
    switch (supplierCode) {
     case MasterDataCode.InHouse:
       this.isExternalSupplier = false;
       break;
     case MasterDataCode.ExternalSupply:
       this.isExternalSupplier = true ;
       this.getSuppliers();
    }
 }

 public getCostCodes(): void {
  try {
    const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.CostCodes);
    this.subscription.push(
      resultResponse
        .pipe(
          catchError((error) => {
            this.toastr.error('Error!', error.message);
            return error;
          })
        )
        .subscribe((res: ResultView<AllMasterData>) => {
          if (res != null) {
            this.costCodes = res.Item.Items;
          }
        })
    );
  } catch (error) {
    console.error('An error occurred while attempting to load master data:', error);
  }

}

 public getSupplyingType(): void {
  try {
    const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.SupplyingType);
    this.subscription.push(
      resultResponse
        .pipe(
          catchError((error) => {
            this.toastr.error('Error!', error.message);
            return error;
          })
        )
        .subscribe((res: ResultView<AllMasterData>) => {
          if (res != null) {
            this.supplyingTypes = res.Item.Items;
          }
        })
    );
  } catch (error) {
    console.error('An error occurred while attempting to load master data:', error);
  }

}


 getSuppliers(): void  {
  const supplierFilter: SupplerListSimpleFilter = {
    IsProduct:true,
    IsRawMaterial: false,
    ProductIds: []
  }

  try {

      const updateResponse = this.supplierService.getSupplierListSimple(supplierFilter);
      this.subscription.push(
        updateResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error.Message);

              return error;
            })
          )
          .subscribe((res: ResultView<SupplierListSimpleVM[]>) => {
            if (res != null) {
              this.supplierList =  res.Item;
            }
          })
      );



  }catch (error) {

    console.error('An error occurred while retrieving the suppliers:', error);
    this.toastr.error('Error!', 'Failed to retriev the supplier.');
  }

}

  getListProducts(): void {
    this.productService
      .listSimpleProducts()
      .subscribe((res: ResultView<ProductListSimpleVM[]>) => {
        this.allProdcuts = res.Item;
        this.staticProductList = this.allProdcuts;
      });
  }

   getUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.ItemUnit);
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.message);
              return error;
            })
          )
          .subscribe((res: ResultView<AllMasterData>) => {
            if (res != null) {
              this.units = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  public getListSimpleRecipes(): void {
    this.subscription.push(
      this.recipeService
        .listSimpleRecipes()
        .subscribe((res: ResultView<RecipeListSimpleVM[]>) => {
          this.recipes = res.Item;
        })
    );
  }


  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  search(): void {

    this.getStocks();
  }

  clear(): void {
    this.searchStockForm.reset();
    this.searchStockForm.controls['supplyingType'].setValue(null);
    this.searchStockForm.controls['supplierId'].setValue(null);
    this.sellingPrice.setValue(null);
    this.costPrice.setValue(null);
    this.getStocks();
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
    }

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
        this.navigateToEditStock(this.id);
        break;
      case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
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



  navigateToEditStock(id: number) {
    this.router.navigate(['base/stock/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/stock/add', 'add']);
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
