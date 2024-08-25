import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subscription } from 'rxjs';
import { EnumType } from 'src/app/models/enum_collection/enumType';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { FoodType } from 'src/app/models/Products/foodType';
import { AllProductVM, RecipeListSimpleVM,   CostCode,   Unit, PaginatedProducts } from 'src/app/models/Products/product';
import { ProductListAdvanceFilter } from 'src/app/models/Products/productListAdvanceFilter';
import { ResultView } from 'src/app/models/ResultView';
import { FoodTypeService } from 'src/app/services/bakery/food-type.service';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { ProductService } from 'src/app/services/bakery/product.service';
import { RecipeService } from 'src/app/services/bakery/reipe.service';
import { ToolbarService } from 'src/app/services/layout/toolbar.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit, OnDestroy{
  subscription: Subscription[] = [];
  displayedColumns: string[] = [
    'select',
    'Name',
    'RecipeName',
    'CostCode',
    'Unit',
    'SellingPrice',
    'CostPrice',
    'AddedDate',
    'ProductDescription',
  ];
  dataSource = new MatTableDataSource<AllProductVM>();
  foodTypes: FoodType[] = [];
  searchProduct: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  recipes: RecipeListSimpleVM[] = [];
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number;
  units: MasterDataVM[];
  showAdvancedFilters = false;
  costCodes: any[] = [
    {
      Id: 0,
      Costcode: 'CC001',
      Description: 'Bakery products',
    },
    {
      Id: 2,
      Costcode: 'CC002',
      Description: 'Vegetables',
    },
    {
      Id: 3,
      Costcode: 'CC003',
      Description: 'Diary products',
    },
  ];

  CostCode = CostCode;
  Unit = Unit;
  header: string;
  getCostCodeType(value: number): string {
    return CostCode[value];
  }
  value1: number = 1500;

  value2: number = 2500;

  value3: number = 4250;

  value4: number = 5002;
  constructor(
    public dialogRef: MatDialogRef<ProductSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private foodItemService: ProductService,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private router: Router,
    private recipeService: RecipeService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.searchFormGroup();
    this.getUnits();
    this.getListSimpleRecipes();

    this.getFoodItemsList();
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
    this.dialogRef.close(this.selectedId);
  }

  search(): void {
    this.getFoodItemsList();
  }

  clear(): void {
    this.searchProduct.reset();
    this.getFoodItemsList();
  }

  searchFormGroup(): void {
    this.searchProduct = this.fb.group({
      sellingPrice: [null],
      costPrice: [null],
      searchString: [null],
      addedDate: [null],
      unit: [null],
      costCode: [null],
      recipeId: [null],
      reOrderLevel:[null],
      weight: [null],
      daysToExpires: [null]
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.getFoodItemsList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getFoodItemsList())
    );
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

  public getUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(
        EnumType.ItemUnit
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
              this.units = res.Item.Items;
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

  public getFoodItemsList(): void {
    this.dataSource.data = null;
    const test  = this.searchProduct.get('recipeId').value?.Id
    const filter: ProductListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      SellingPrice: this.searchProduct.get('sellingPrice').value,
      Unit: this.searchProduct.get('unit').value,
      SearchString: this.searchProduct.get('searchString').value,
      AddedDate: this.searchProduct.get('addedDate').value ?? null,
      CostCode: this.searchProduct.get('costCode').value,
      RecipeId: this.searchProduct.get('recipeId').value,
      CostPrice: this.searchProduct.get('costPrice').value,
      Weight: this.searchProduct.get('weight').value ? (this.searchProduct.get('weight').value)/1000 : null,
      ReOrderLevel:  this.searchProduct.get('reOrderLevel').value,
      DaysToExpires:  this.searchProduct.get('daysToExpires').value,
      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.foodItemService
      .getProducts(filter)
      .subscribe((res: ResultView<PaginatedProducts>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0;
        this.dataSource.sort = this.sort;
      });
  }



  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }

  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
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

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }


  ngOnDestroy(): void {
    this.toolbarService.unsubscribeAll();
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

}
