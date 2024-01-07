import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenavbar',
  templateUrl: './sidenavbar.component.html',
  styleUrls: ['./sidenavbar.component.css']
})
export class SidenavbarComponent {
  @Output() sidenavClose = new EventEmitter();
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSidenavClose() {
    this.sidenavClose.emit();
  }

  navigateToProducts() {
   this.router.navigate(['base/product']);
  }
}
