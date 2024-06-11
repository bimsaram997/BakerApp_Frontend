import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription, catchError } from 'rxjs';
import { FoodType } from '../../../models/Products/foodType';
import {
  AllProductVM,
  CostCode,
  PaginatedProducts,
  RecipeListSimpleVM,
  Unit,
} from '../../../models/Products/product';
import { ProductListAdvanceFilter } from '../../../models/Products/productListAdvanceFilter';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { ProductService } from '../../../services/bakery/product.service';
import { RecipeService } from '../../../services/bakery/reipe.service';
import { ToolbarService } from '../../../services/layout/toolbar.service';
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
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  header: string = 'Products';
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
    'ModifiedDate',
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
  getCostCodeType(value: number): string {
    return CostCode[value];
  }

  constructor(
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
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getListSimpleRecipes();

    this.getFoodItemsList();
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

  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        this.handleUpdateButton();
        break;
      case ToolbarButtonType.Edit:
        this.navigateToEditproduct(this.id);
        break;
      case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  navigateToEditproduct(id: number) {
    this.router.navigate(['base/product/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/product/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
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

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.toolbarService.unsubscribeAll();
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
