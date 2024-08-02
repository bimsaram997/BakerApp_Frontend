import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, Subscription } from 'rxjs';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { AllLocationVM, LocationAdvanceFilter, PaginatedLocationData } from '../../../models/Location/location';
import {
  AllEnumTypeVM,
  EnumType,
  PaginateEnumTypeData,
} from '../../../models/enum_collection/enumType';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { Router } from '@angular/router';
import { EnumTranslationService } from '../../../services/bakery/enum-translation.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AddLocationComponent } from '../add-location/add-location.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { ResultView } from 'src/app/models/ResultView';
import { LocationService } from 'src/app/services/bakery/location.service';
@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent {
  subscription: Subscription[] = [];
  header: string = 'Location';
  toolBarButtons: ToolbarButtonType[];
  searchLocation: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'LocationCode',
    'LocationName',
    'StatusName',
    'AddedDate',
    'Addresses',
  ];
  dataSource = new MatTableDataSource<AllLocationVM>();
  selectedId: string | null = null;
  id: number;
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  statuses:MasterDataVM[];
  constructor(
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private enumTranslationService: EnumTranslationService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private locationService: LocationService,
    private masterDataService: MasterDataService
  ) {}
  ngOnInit() {
    this.getStatuses();
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.loadLocationData();
  }

  searchFormGroup(): void {
    this.searchLocation = this.fb.group({
      searchString: [null],
      addedDate: [null],
      status: [null],
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddLocationComponent, {
      data: { edit: this.isEdit, id: this.selectedId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLocationData();
      }
    });
  }


  loadLocationData(): void {
    this.dataSource.data = null;
    const filter: LocationAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Status: this.searchLocation.get('status').value,
      SearchString: this.searchLocation.get('searchString').value,
      AddedDate: this.searchLocation.get('addedDate').value,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.locationService.getLocationData(filter)
      .subscribe((res: ResultView<PaginatedLocationData>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0; // Update paginator length
        this.dataSource.sort = this.sort;
      });
  }


  getStatuses(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.Status);
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
              this.statuses = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }


  search(): void {
    this.loadLocationData();
  }

  clear(): void {
    this.searchLocation.reset();
    this.loadLocationData();
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
        this.loadLocationData();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.loadLocationData())
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
