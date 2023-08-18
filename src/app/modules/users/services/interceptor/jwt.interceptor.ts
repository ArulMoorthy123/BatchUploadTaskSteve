import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { HttpCallHandleService } from './http-call-handle.service';
import { takeUntil, timeout } from 'rxjs/operators';
import { Router, ActivationEnd } from '@angular/router';
import { API_TIMEOUT_LIMIT } from 'src/app/modules/core/helpers/app.config';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {


  constructor(private authenticationService: AuthService,
    private router: Router,
    private httpcallHandle: HttpCallHandleService) {

    this.router.events.subscribe(event => {
      // An event triggered at the end of the activation part of the Resolve phase of routing.
      if (event instanceof ActivationEnd) {
        // Cancel pending calls
        // this.httpcallHandle.cancelPendingRequests();
      }
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authenticationService.getToken();
    if (token) {
      if (request.headers.get('Anonymous') !== 'undefined') {
        request = request.clone({
          setHeaders: {
            //'Content-Type': 'application/json',
            //'Accept': 'application/json',
            //'Access-Control-Allow-Origin': '*',
            'X-AppName': 'Career Journey',
            'Authorization': 'Bearer ' + token,
          },
        });
      }else {
        request = request.clone({ headers: request.headers.delete('Anonymous','undefined') });
      }
    }
    return next.handle(request).pipe(timeout(API_TIMEOUT_LIMIT),takeUntil(this.httpcallHandle.onCancelPendingRequests()));
  }
}
