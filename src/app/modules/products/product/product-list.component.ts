import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FoodType } from '../../../models/Products/foodType';
import { AllProductVM, CostCode, PaginatedProducts, RecipeListSimpleVM, Unit } from '../../../models/Products/product';
import { ProductListAdvanceFilter } from '../../../models/Products/productListAdvanceFilter';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { ProductService } from '../../../services/bakery/product.service';
import { RecipeService } from '../../../services/bakery/reipe.service';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  header: string = 'Products';
  subscription: Subscription[] = [];
  displayedColumns: string[] = ['select', 'Name', 'RecipeName','CostCode', 'Unit', 'SellingPrice', 'CostPrice', 'AddedDate', 'ModifiedDate',  'ProductDescription'];
  dataSource = new MatTableDataSource<AllProductVM>();
  foodTypes: FoodType[] = [];
  searchProduct: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  recipes: RecipeListSimpleVM[] = [];
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number
  units: any[] = [
    {Id: 0, name: "PCS"}, {Id: 1, name: "HRS"}
  ];
  costCodes: any[] = [
    {
      Id: 0,
      Costcode: "CC001",
      Description: "Bakery products"
  },
  {
      Id: 2,
      Costcode: "CC002",
      Description: "Vegetables"
  },
  {
    Id: 3,
    Costcode: "CC003",
    Description: "Diary products"
},
  ];

  CostCode = CostCode;
  Unit = Unit;
  getCostCodeType(value: number): string {
    return CostCode[value];
  }
  getUnitType(value: number): string {
    return Unit[value];
  }

  constructor(
    private foodItemService: ProductService,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit() {
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getListSimpleRecipes();
    this.valueChanges();
    this.getFoodItemsList();


  }

  valueChanges(): void {

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
      unit:[null],
      costCode: [null],
      recipeId: [null],
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0; // Reset pageIndex when sorting
        this.getFoodItemsList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getFoodItemsList())
    );
  }

  public  getListSimpleRecipes(): void {
    this.subscription.push(this.recipeService.listSimpleRecipes().subscribe((recipe: RecipeListSimpleVM[]) => {
      this.recipes = recipe;
    }))
  }

  public getFoodItemsList(): void {
    this.dataSource.data =  null;
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

    this.foodItemService.getProducts(filter).subscribe((res: PaginatedProducts) => {
      this.dataSource.data = res.Items;
      this.dataSource.paginator = this.paginator;
      this.paginator.length = res.TotalCount || 0; // Update paginator length
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
    this.router.navigate(['base/product/add', 'edit', id]);

  }

  public handleNewButton(): void {
    this.router.navigate(['base/product/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
    // Add your update logic here
  }

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }


  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      // Check if Edit and Delete buttons are not already in the array
      const hasEditButton = this.toolBarButtons.includes(ToolbarButtonType.Edit);
      const hasDeleteButton = this.toolBarButtons.includes(ToolbarButtonType.Delete);

      // Add Edit and Delete buttons if they are not already present
      if (!hasEditButton) {
        this.toolBarButtons.push(ToolbarButtonType.Edit);
      }
      if (!hasDeleteButton) {
        this.toolBarButtons.push(ToolbarButtonType.Delete);
      }

      // Update custom buttons
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.removeSpecificButtons();
    }

    // Rest of your logic remains the same
    if (this.selectedId === id) {
      // Uncheck the checkbox if it's already selected
      this.selectedId = null;
      this.id =  null;
    } else {
      // Check the checkbox and update selectedId
      this.selectedId = id;
      this.id = +id;
      console.log(this.selectedId); // Output the selected ID to console
    }

  }

  removeSpecificButtons(): void {
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Delete);


    // Check if the buttons exist in the array before removing
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1); // Remove Delete button
    }
    const editIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (editIndex !== -1) {
      this.toolBarButtons.splice(editIndex, 1); // Remove Edit button
    }
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent("");
    this.toolbarService.unsubscribeAll();
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
