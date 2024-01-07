import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-mainheader',
  templateUrl: './mainheader.component.html',
  styleUrls: ['./mainheader.component.css']
})
export class MainheaderComponent  implements OnInit{
  @Output() public sidenavToggle = new EventEmitter();
  ngOnInit(): void {
  }
  onToogleSlidenav() {
    this.sidenavToggle.emit();
  }
}
