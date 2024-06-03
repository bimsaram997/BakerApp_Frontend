import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private tokenExpirationTimeout: any;

  constructor(private router: Router, private toastr: ToastrService,) { }

  setToken(token: string): void {
    this.token = token;
    this.setTokenExpiration(token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.toastr.info('Logging out!', 'Please login again');
    this.token = null;
    clearTimeout(this.tokenExpirationTimeout);
    this.router.navigate(['']); // Redirect to login page after token is cleared
  }

  private setTokenExpiration(token: string): void {
    const decoded: any = jwtDecode(token);
    const expiresAt = decoded.exp * 1000; // JWT exp is in seconds, convert to milliseconds

    const now = Date.now();
    const timeout = expiresAt - now;

    if (timeout > 0) {
      this.tokenExpirationTimeout = setTimeout(() => {
        this.clearToken();
      }, timeout);
    } else {
      this.clearToken(); // Token already expired
    }
  }
}
