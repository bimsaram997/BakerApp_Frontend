import { Component, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { catchError, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  AllMasterData,
  AllMasterDataVM,
  MasterDataListAdvanceFilter,
  MasterDataVM,
  PaginateMasterData,
} from '../../../models/MasterData/MasterData';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EnumTranslationService } from '../../../services/bakery/enum-translation.service';
import {
  AllEnumTypeVM,
  EnumType,
  PaginateEnumTypeData,
} from '../../../models/enum_collection/enumType';
import { MatDialog } from '@angular/material/dialog';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/services/bakery/role.service';
import {
  AllRolesVM,
  PaginatedRoles,
  RoleAdvanceFilter,
} from 'src/app/models/role/role';
import { LocationService } from 'src/app/services/bakery/location.service';
import {
  AllLocationListSimple,
  LocationlListSimpleVM,
} from 'src/app/models/Location/location';
import { AddRoleComponent } from '../add-role/add-role.component';
@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css'],
})
export class RoleListComponent {
  searchForm: FormGroup;
  subscription: Subscription[] = [];
  header: string = 'Roles';
  toolBarButtons: ToolbarButtonType[];
  searchUserForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'Id',
    'RoleName',
    'StatusName',
    'LocationName',
    'RoleDescription',
    'AddedDate',
    'ModifiedDate',
  ];
  selectedId: string | null = null;
  id: number;
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  statuses: MasterDataVM[];
  locations: LocationlListSimpleVM[];
  dataSource = new MatTableDataSource<AllRolesVM>();
  constructor(
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private rolesService: RoleService,
    private locationService: LocationService
  ) {}
  ngOnInit() {
    this.searchFormGroup();
    this.getStatuses();
    this.listSimpleLocations();
    this.loadRoleData();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  searchFormGroup(): void {
    this.searchForm = this.fb.group({
      searchString: [null],
      status: [null],
      locationId: [null],
      addedDate: [null],
      roleDescription: [null],
    });
  }

  listSimpleLocations(): void {
    try {
      const resultResponse = this.locationService.locationListSimple();
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error(
                'Error!',
                error.error?.Message ?? error.message
              );
              return error;
            })
          )
          .subscribe((res: ResultView<LocationlListSimpleVM[]>) => {
            if (res != null) {
              this.locations = res.Item;
            }
          })
      );
    } catch (error) {
      console.error(
        'An error occurred while attempting to load location data:',
        error
      );
    }
  }

  getStatuses(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(
        EnumType.Status
      );
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error(
                'Error!',
                error.error?.Message ?? error.message
              );
              return error;
            })
          )
          .subscribe((res: ResultView<AllMasterData>) => {
            if (res != null) {
              this.statuses = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error(
        'An error occurred while attempting to load location data:',
        error
      );
    }
  }

  loadRoleData(): void {
    this.dataSource.data = null;
    const filter: RoleAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Status: this.searchForm.get('status').value,
      SearchString: this.searchForm.get('searchString').value,
      AddedDate: this.searchForm.get('addedDate').value,
      LocationId: this.searchForm.get('locationId').value,
      RoleDescription: this.searchForm.get('roleDescription').value,
      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.rolesService
      .getRoles(filter)
      .subscribe((res: ResultView<PaginatedRoles>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0; // Update paginator length
        this.dataSource.sort = this.sort;
      });
  }
  search(): void {
    this.loadRoleData();
  }

  clear(): void {
    this.searchForm.reset();
    this.loadRoleData();
  }

  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.isEdit = false;
        this.openDialog();
        this.isEdit = false;
        break;
      case ToolbarButtonType.Update:
        break;
      case ToolbarButtonType.Edit:
        this.isEdit = true;
        this.openDialog();
        break;
      case ToolbarButtonType.Delete:
        // this.handleDelete();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddRoleComponent, {
      data: { edit: this.isEdit, id: this.selectedId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRoleData();
      }
      this.selectedId = null;
      this.id = null;
      this.removeSpecificButtons();
    });
  }
  navigateToEditLocationData(id: number) {
    this.isEdit = true;
    this.selectedId = id.toString();
    this.openDialog();
  }

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }

  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      // Check if Edit and Delete buttons are not already in the array
      const hasEditButton = this.toolBarButtons.includes(
        ToolbarButtonType.Edit
      );

      // Add Edit and Delete buttons if they are not already present
      if (!hasEditButton) {
        this.toolBarButtons.push(ToolbarButtonType.Edit);
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
      this.id = null;
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

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.loadRoleData();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.loadRoleData())
    );
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
