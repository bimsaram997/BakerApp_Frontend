import { Component } from '@angular/core';
import { fadeInAnimation } from '../../_animations';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' },
})
export class BaseComponent {
  public isSidenavOpen = true;
  ngOnInit(): void {}
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
