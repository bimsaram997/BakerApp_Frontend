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

  ngOnInit(): void {
    //const config  = require('assets/config.json'); //use service for import this config
    //test config.font
  }
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
