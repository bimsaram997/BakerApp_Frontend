import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/bakery/auth.service';

@Component({
  selector: 'app-mainheader',
  templateUrl: './mainheader.component.html',
  styleUrls: ['./mainheader.component.css']
})
export class MainheaderComponent  implements OnInit{
  @Output() public sidenavToggle = new EventEmitter();

  constructor(private router: Router,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
  }
  onToogleSlidenav() {
    this.sidenavToggle.emit();
  }

  public logOut(): void {
    this.authService.clearToken();
    this.router.navigate(['']);
  }
}
