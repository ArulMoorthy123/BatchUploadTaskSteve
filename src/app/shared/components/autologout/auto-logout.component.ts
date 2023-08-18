import { Component, OnInit } from '@angular/core';
import { AutoLogoutService } from '../../services/auto-logout.service';


@Component({
selector: 'app-auto-logout',
templateUrl: './auto-logout.component.html',
providers: [AutoLogoutService]
})


export class AutoLogoutComponent implements OnInit {

    constructor(private autoLogoutService: AutoLogoutService) { }

    ngOnInit() {
      localStorage.setItem('lastAction', Date.now().toString());
    }
   }
