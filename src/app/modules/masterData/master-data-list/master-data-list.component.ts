import { Component, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  AllMasterDataVM,
  MasterDataListAdvanceFilter,
  PaginateMasterData,
} from '../../../models/MasterData/MasterData';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EnumTranslationService } from '../../../services/bakery/enum-translation.service';
import {
  AllEnumTypeVM,
  PaginateEnumTypeData,
} from '../../../models/enum_collection/enumType';
import { MatDialog } from '@angular/material/dialog';
import { AddMasterDataComponent } from '../add-master-data/add-master-data.component';
import { ToastrService } from 'ngx-toastr';
import { ResultView } from 'src/app/models/ResultView';
@Component({
  selector: 'app-master-data-list',
  templateUrl: './master-data-list.component.html',
  styleUrls: ['./master-data-list.component.css'],
})
export class MasterDataListComponent {
  subscription: Subscription[] = [];
  header: string = 'Master data';
  toolBarButtons: ToolbarButtonType[];
  searchUserForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'MasterDataCode',
    'MasterDataName',
    'MasterDataSymbol',
    'MasterColorCode',
    'EnumType',
    'AddedDate',
    'ModifiedDate',
  ];
  dataSource = new MatTableDataSource<AllMasterDataVM>();
  selectedId: string | null = null;
  id: number;
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  constructor(
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private enumTranslationService: EnumTranslationService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.searchFormGroup();
    this.loadEnumTypeData();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.getMasterData();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddMasterDataComponent, {
      data: { edit: this.isEdit, id: this.selectedId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getMasterData();
      }
    });
  }

  search(): void {
    this.getMasterData();
  }

  clear(): void {
    this.searchUserForm.reset();
    this.getMasterData();
  }
  public getMasterData(): void {
    this.dataSource.data = null;
    const filter: MasterDataListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      EnumTypeId: this.searchUserForm.get('enumTypeId').value,
      SearchString: this.searchUserForm.get('searchString').value,
      AddedDate: this.searchUserForm.get('addedDate').value ?? null,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.masterDataService
      .getMasterData(filter)
      .subscribe((res: ResultView<PaginateMasterData>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0; // Update paginator length
        this.dataSource.sort = this.sort;
      });
  }

  loadEnumTypeData(): void {
    this.subscription.push(
      this.enumTranslationService
        .getEnumData()
        .subscribe((res: PaginateEnumTypeData) => {
          this.enumDataList = res.Items;
        })
    );
  }

  searchFormGroup(): void {
    this.searchUserForm = this.fb.group({
      searchString: [null],
      addedDate: [null],
      enumTypeId: [null],
    });
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
        this.handleDelete();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }
  navigateToEdiMasterData(id: number) {
    this.isEdit = true;
    this.selectedId = id.toString();
    this.openDialog();
  }

  handleDelete(): void {
    this.subscription.push(
      this.masterDataService
        .deleteMasterDataById(+this.selectedId)
        .subscribe((res: any) => {
          if (res != null) {
            this.toastr.success('Success!', 'Master data deleted!');
            this.getMasterData();
          }
        })
    );
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
      const hasDeleteButton = this.toolBarButtons.includes(
        ToolbarButtonType.Delete
      );

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
        this.getMasterData();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getMasterData())
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
