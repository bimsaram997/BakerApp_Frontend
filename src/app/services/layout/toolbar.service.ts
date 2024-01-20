// toolbar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToolbarButtonType } from '../../models/enum_collection/toolbar-button';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  private toolbarContentSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public toolbarContent$: Observable<string> = this.toolbarContentSubject.asObservable();

  private customButtonsSubject: BehaviorSubject<ToolbarButtonType[]> = new BehaviorSubject<ToolbarButtonType[]>([]);
  public customButtons$: Observable<ToolbarButtonType[]> = this.customButtonsSubject.asObservable();

  private buttonClickSubject: BehaviorSubject<ToolbarButtonType | null> = new BehaviorSubject<ToolbarButtonType | null>(null);
  public buttonClick$: Observable<ToolbarButtonType | null> = this.buttonClickSubject.asObservable();

  updateToolbarContent(content: string): void {
    this.toolbarContentSubject.next(content);
  }

  updateCustomButtons(buttons: ToolbarButtonType[]): void {
    this.customButtonsSubject.next(buttons);
  }

  handleButtonClick(buttonType: ToolbarButtonType): void {
    this.buttonClickSubject.next(buttonType);
  }
}
