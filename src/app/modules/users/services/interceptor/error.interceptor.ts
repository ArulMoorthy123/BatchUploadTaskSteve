import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService,
    private toastr: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(catchError(error => {
      switch (error.status) {
        case 401:
          this.toastr.warning(error.error.error_description + '. Please login again.', error.error.error);
          this.authenticationService.logout();
          break;
        case 400:
          if (error.error.message)
            this.toastr.warning(error.error.message, error.status, { });
          else
            this.toastr.error(error.message, error.status, { });
          break;
        case 500:
          this.toastr.error('Internal Server Error');
          break;
        default:

          break;
      }

      //if (err.status === 401 && this.authenticationService.currentUserValue) {
      // auto logout if 401 response returned from api

      // location.reload(true);
      //}

      const error_msg = error.error.message || error.statusText;
      return throwError(error_msg);
    }));
  }
}
