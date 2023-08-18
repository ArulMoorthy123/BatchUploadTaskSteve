import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './modules/users/services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        let stateUrl = state.url.slice(1).split('?')[0];
        //console.log("Auth Guard Check user-> ", currentUser);
        if (currentUser) {
            // check if route is restricted by role
            //console.log("Auth Guard Check user role -> ", currentUser.role[0].name);
            if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
                // role not authorised so redirect to home page
                this.router.navigate(['/']);
                return false;
            }
            // authorised so return true
            //console.log("stateUrl -> ",stateUrl);
            return true;
        }
        else {
            // not logged in so redirect to home page with
            this.authenticationService.logout();
            //this.router.navigate(['/']);
            return false;
        }
    }
}

@Injectable({
  providedIn: 'root'
})
export class LoginCheckGuard implements CanActivate {
  constructor(
    private authenticationService: AuthService
) { }

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.authenticationService.loginStatus()) {
      return true;
    } else {
      this.authenticationService.redirectToDashboard();
    }
  }
}
