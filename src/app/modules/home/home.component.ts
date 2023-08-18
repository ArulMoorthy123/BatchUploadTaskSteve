import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../modules/users/services/auth.service';

declare const $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  submitted: boolean = false;
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.initVariable();
    //    this.initRegForm();
    let partners_slider = $('.slogan_slider');
    this.owc_slider(partners_slider, 1, 1, 1, 10, true);
  }

  get loginStatus(): boolean {
    return this.auth.loginStatus();
  }

  initVariable() {
    this.submitted = false;
  }

  owc_slider(
    slider_object,
    desktop,
    tablate,
    mobile,
    margin,
    loop = false,
    autoplay = true,
    nav = true
  ) {
    slider_object.owlCarousel({
      loop: loop,
      animateOut: 'fadeOut',
      animateIn: 'flipInX',
      autoplay: autoplay,
      autoplayHoverPause: true,
      margin: margin,
      autoplayTimeout: 3000,
      dots: false,
      nav: nav,
      //singleItem:true,
      navText: [
        "<i class='fa fa-angle-left'></i>",
        "<i class='fa fa-angle-right'></i>",
      ],
      responsive: {
        0: {
          items: mobile,
        },
        600: {
          items: tablate,
        },
        1000: {
          items: desktop,
        },
      },
    });
  }

  ngOnDestroy() {
    this.initVariable();
  }
}
