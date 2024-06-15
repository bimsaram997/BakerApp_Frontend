import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Router } from '@angular/router';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { ToolbarService } from '../../../services/layout/toolbar.service';
@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy  {
  header: string = 'Suppliers';
  subscription: Subscription[] = [];

  searchUserForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'FirstName',
    'LastName',
    'PhoneNumber',
    'Role',
    'AddedDate',
    'Email',
    'Gender',
    'Address',
    'ModifiedDate',
  ];
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number;
  constructor(
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
   // this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons([ToolbarButtonType.New]);
  //  this.getListSimpleRecipes();

  //  this.getFoodItemsList();
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
    this.router.navigate(['base/supplier/add', 'view', id]);
  }

  public handleNewButton(): void {
    this.router.navigate(['base/supplier/add', 'add']);
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
