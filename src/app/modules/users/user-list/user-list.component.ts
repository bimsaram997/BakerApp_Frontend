import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { AllRawMaterialVM, GenderType, LocationType, PaginatedRawMaterials, QuantityType, RawMaterialListAdvanceFilter, RoleType } from 'src/app/models/RawMaterials/RawMaterial';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AllUserVM, PaginatedUsers, UserAdvanceListFilter } from 'src/app/models/User/User';
import { LoginServiceService } from 'src/app/services/bakery/login-service.service';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  header: string = 'Users';
  subscription: Subscription[] = [];

  searchUserForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [ 'select', 'FirstName', 'LastName', 'PhoneNumber', 'Role',
   'AddedDate', 'Email', 'Gender', 'Address', 'ModifiedDate'];
  dataSource = new MatTableDataSource<AllUserVM>();
  QuantityType = QuantityType; // Import the enum
  LocationType = LocationType;
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number

  genders: any[] = [
    { Id: 0, name: 'Male' },
    { Id: 1, name: 'Female' },
  ];
  roles: any[] = [
    { Id: 0, name: 'Admin' },
    { Id: 1, name: 'User' },
  ];
  countries: any[] = [
    { Id: 0, name: 'Sri Lanka' },
    { Id: 1, name: 'Finland' },
  ];

  getGenderType(value: number): string {
    return GenderType[value];
  }

  getRoleType(value: number): string {
    return RoleType[value];
  }

  constructor(private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginServiceService
  ) {

  }
  ngOnInit() {
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.getUserList();

  }



  search(): void {
    this.getUserList();
  }

  clear(): void {
    this.searchUserForm.reset();
    this.getUserList();
  }

  searchFormGroup(): void {
    this.searchUserForm = this.fb.group({
      firstName: [null],
      lastName: [null],
      searchString: [null],
      addedDate: [null],
      gender:[null],
      role: [null],
      phoneNumber: [null],
      email: [null],
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.getUserList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getUserList())
    );
  }



  public getUserList(): void {
    this.dataSource.data =  null;
    const filter: UserAdvanceListFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      PhoneNumber: this.searchUserForm.get('phoneNumber').value,
      Role: this.searchUserForm.get('role').value,
      SearchString: this.searchUserForm.get('searchString').value,
      AddedDate: this.searchUserForm.get('addedDate').value ?? null,
      Email: this.searchUserForm.get('email').value,
      Gender: this.searchUserForm.get('gender').value,
      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.loginService.getUsers(filter).subscribe((res: PaginatedUsers) => {
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
       this.navigateToEditUser(this.id);
        break;
        case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }


  navigateToEditUser(id: number) {
    this.router.navigate(['base/user/add', 'edit', id]);

  }

  public handleNewButton(): void {
    this.router.navigate(['base/user/add', 'add']);
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
