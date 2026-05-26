import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Show spinner/loading state
    this.loadingService.show();

    let apiReq = request;
    const isBackendCall = request.url.includes('/api');

    // 1. Attach JWT token if available
    const token = this.authService.token;
    if (token && isBackendCall) {
      apiReq = apiReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 2. Automatically inject a delay parameter to backend requests if not already specified
    // This guarantees we showcase the async processing/loading animations throughout the application.
    if (isBackendCall && !request.params.has('delay')) {
      const delayVal = '1200'; // Default 1.2s delay for demonstration
      apiReq = apiReq.clone({
        setParams: {
          delay: delayVal
        }
      });
    }

    // Pass the request forward and hide spinner when request completes (success/error)
    return next.handle(apiReq).pipe(
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
