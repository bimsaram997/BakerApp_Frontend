import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { SearchItemType } from '../../../models/enum_collection/enumType'
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ProductListSimpleVM } from '../../../models/Products/product';
import { RawMaterialListSimpleVM } from '../../../models/RawMaterials/RawMaterial';
import { ToastrService } from 'ngx-toastr';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { Router } from '@angular/router';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ProductService } from '../../../services/bakery/product.service';
import { ResultView } from 'src/app/models/ResultView';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent {
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
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
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;
  productSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  isRawMaterial: boolean = null;
  header: string = 'Stock';

  constructor(
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private productService: ProductService,
  ) {}

  ngOnInit() {
   // this.searchFormGroup();
    //this.getListRawMaterials();
   this.getListProducts();
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

  getListProducts(): void {
    this.productService
      .listSimpleProducts()
      .subscribe((res: ResultView<ProductListSimpleVM[]>) => {
        this.allProdcuts = res.Item;
        this.staticProductList = this.allProdcuts;
      });
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

  navigateToEditStock(id: number) {
    this.router.navigate(['base/stock/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/stock/add', 'add']);
  }
}
