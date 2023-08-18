import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './modules/users/services/auth.service';

import { SEOService } from './shared/services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Career Journey';
  constructor(private router: Router, private seoService: SEOService,
    private authenticationService: AuthService) {
    this.seoService.updateTitle();
    let currentUser = this.authenticationService.getUserDetails();
    this.authenticationService.setUserBS(currentUser);
  }

  ngOnInit() {

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
