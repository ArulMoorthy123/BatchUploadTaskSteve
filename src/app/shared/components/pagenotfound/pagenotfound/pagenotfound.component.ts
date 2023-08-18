import { Component, OnInit } from '@angular/core';
import { UrlService } from 'src/app/shared/services/url.service';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent implements OnInit {

  urlService = UrlService;
  constructor() { }

  ngOnInit(): void {
  }

}
