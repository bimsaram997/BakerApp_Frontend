import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  header: string = 'Recipes';
  subscription: Subscription[] = [];
  toolBarButtons: ToolbarButtonType[];
  constructor(private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,) {

  }
  ngOnInit(){
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.subscription.push(
      this.toolbarService.buttonClick$.subscribe((buttonType) => {
        if (buttonType) {
          this.handleButtonClick(buttonType);
        }
      })
    );
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
       // this.handleUpdateButton();
        break;
        case ToolbarButtonType.Edit:
        //this.navigateToEditRawMaterial(this.id);
        break;
        case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  private handleNewButton(): void {
    this.router.navigate(['base/recipe/add', 'add']);
  }
  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent("");
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
