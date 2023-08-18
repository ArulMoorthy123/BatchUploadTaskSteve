import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private toastrService: ToastrService, private http: HttpClient) {}

  alertMessage(status, message, tittle = '') {
    switch (status) {
      case 'success':
        this.toastrService.success(message, tittle);
        break;
      case 'error':
        this.toastrService.error(message, tittle);
        break;

      default:
        this.toastrService.warning(message, tittle);
        break;
    }
  }
}
