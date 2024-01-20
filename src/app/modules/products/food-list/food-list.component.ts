import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { FoodItemsService } from '../../../services/bakery/food-items.service';
import { ProductListAdvanceFilter } from '../../../models/FoodItems/productListAdvanceFilter';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AllFoodItemVM, PaginatedFoodItems } from '../../../models/FoodItems/foodItem';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/FoodItems/foodType';
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
  displayedColumns: string[] = ['FoodCode','BatchId', 'FoodTypeName', 'FoodPrice', 'AddedDate', 'IsSold', 'FoodDescription', 'Action'];
  dataSource = new MatTableDataSource<AllFoodItemVM>();
  foodTypes: FoodType[] = [];
  foodTypeForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private foodItemService: FoodItemsService,
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
    this.subscription.push(
      this.toolbarService.buttonClick$.subscribe((buttonType) => {
        if (buttonType) {
          this.handleButtonClick(buttonType);
        }
      })
    );

  }

  valueChanges(): void {
    // this.foodTypeForm.valueChanges.subscribe((res: any) => {
    //   this.getFoodItemsList();
    // })
  }

  search(): void {
    this.getFoodItemsList();
  }

  clear(): void {
    this.foodTypeForm.reset();
    this.getFoodItemsList();
  }

  searchFormGroup(): void {
    this.foodTypeForm = this.fb.group({
      foodTypId: [null],
      foodPrice: [null],
      searchString: [null],
      addedDate: [null],
      batchId: [null],
      available: [null],

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
    const filter: ProductListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: true,
      FoodTypeId:  this.foodTypeForm.get('foodTypId').value,
      FoodPrice: this.foodTypeForm.get('foodPrice').value,
      SearchString: this.foodTypeForm.get('searchString').value,
      AddedDate: this.foodTypeForm.get('addedDate').value ?? null,
      BatchId: this.foodTypeForm.get('batchId').value,
      Available: this.foodTypeForm.get('available').value,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.foodItemService.getFoodItems(filter).subscribe((res: PaginatedFoodItems) => {
      this.dataSource.data = res.Items;
      this.dataSource.paginator = this.paginator;
      this.paginator.length = res.TotalCount || 0; // Update paginator length
      this.dataSource.sort = this.sort;
    });
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.handleSaveButton();
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

  private handleSaveButton(): void {
    console.log('Save button clicked - Dummy implementation');
    // Add your save logic here
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
