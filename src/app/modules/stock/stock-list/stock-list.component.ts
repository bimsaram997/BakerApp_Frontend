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
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;
  productSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  isRawMaterial: boolean = null;
  header: string = 'Stock';
  itemCount: FormControl<any>;
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
  constructor(
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private productService: ProductService,
    private recipeService: RecipeService,
    private supplierService: SupplierService,
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
    //this.getFoodItemsList();
  }

  clear(): void {
    this.searchStockForm.reset();
   // this.getFoodItemsList();
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


  navigateToEditStock(id: number) {
    this.router.navigate(['base/stock/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/stock/add', 'add']);
  }
}
