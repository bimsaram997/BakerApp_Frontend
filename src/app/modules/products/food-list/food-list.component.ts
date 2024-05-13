import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ProductService } from '../../../services/bakery/product.service';
import { ProductListAdvanceFilter } from '../../../models/Products/productListAdvanceFilter';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AllProductVM, PaginatedProducts } from '../../../models/Products/product';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/Products/foodType';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-food-list',
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.css']
})
export class FoodListComponent implements OnInit, OnDestroy {
  header: string = 'Food items';
  subscription: Subscription[] = [];
  displayedColumns: string[] = ['ProductCode','BatchId', 'FoodTypeName', 'ProductPrice', 'AddedDate', 'ModifiedDate', 'IsSold', 'ProductDescription', 'Action'];
  dataSource = new MatTableDataSource<AllProductVM>();
  foodTypes: FoodType[] = [];
  searchFoodItemForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private foodItemService: ProductService,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
    this.getListSimpleFoodTypes();
    this.valueChanges();
    this.getFoodItemsList();
    this.toolbarService.subscribeToButtonClick((buttonType: ToolbarButtonType) => {
      this.handleButtonClick(buttonType);
    });

  }

  valueChanges(): void {
    // this.searchFoodItemForm.valueChanges.subscribe((res: any) => {
    //   this.getFoodItemsList();
    // })
  }

  search(): void {
    this.getFoodItemsList();
  }

  clear(): void {
    this.searchFoodItemForm.reset();
    this.getFoodItemsList();
  }

  searchFormGroup(): void {
    this.searchFoodItemForm = this.fb.group({
      foodTypId: [null],
      productPrice: [null],
      searchString: [null],
      addedDate: [null],
      batchId: [null],
      available: [null],
      image: [null]

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

  public  getListSimpleFoodTypes(): void {
    this.subscription.push(this.foodTypeService.getListSimpleFoodTypes().subscribe((foodTypes: FoodType[]) => {
      this.foodTypes = foodTypes;
    }))
  }

  public getFoodItemsList(): void {
    this.dataSource.data =  null;
    const filter: ProductListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      FoodTypeId:  this.searchFoodItemForm.get('foodTypId').value,
      ProductPrice: this.searchFoodItemForm.get('productPrice').value,
      SearchString: this.searchFoodItemForm.get('searchString').value,
      AddedDate: this.searchFoodItemForm.get('addedDate').value ?? null,
      BatchId: this.searchFoodItemForm.get('batchId').value,
      Available: this.searchFoodItemForm.get('available').value,

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



  navigateToEditFoodItem(id: number) {
    this.router.navigate(['base/product/add', 'edit', id]);

  }

  public handleNewButton(): void {
    this.router.navigate(['base/product/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
    // Add your update logic here
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
