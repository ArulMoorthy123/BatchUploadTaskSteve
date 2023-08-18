import { UrlService } from 'src/app/shared/services/url.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wip',
  templateUrl: './wip.component.html',
  styleUrls: ['./wip.component.scss']
})
export class WipComponent implements OnInit {

  urlService = UrlService;
  constructor() { }

  ngOnInit(): void {
  }

}
