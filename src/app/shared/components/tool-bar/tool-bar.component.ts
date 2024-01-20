import { Component } from '@angular/core';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent {
  toolbarContent: string = '';
  customButtons: ToolbarButtonType[] = [];
  private subscription: Subscription;

  constructor(private toolbarService: ToolbarService) {
    this.subscription = this.toolbarService.toolbarContent$.subscribe((content: string) => {
      this.toolbarContent = content;
    });

    this.subscription.add(this.toolbarService.customButtons$.subscribe((buttons: ToolbarButtonType[]) => {
      this.customButtons = buttons;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleButtonClick(buttonType: ToolbarButtonType): void {
    this.toolbarService.handleButtonClick(buttonType);
  }
}
