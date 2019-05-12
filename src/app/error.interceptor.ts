import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ErrorComponent } from "./error/error/error.component";
import { MatSnackBar } from "@angular/material";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}
  durationInSeconds = 3;

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An unknown error occured!!";
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.openFromComponent(ErrorComponent, {
          duration: this.durationInSeconds * 1000,
          data: { message: errorMessage },
          panelClass: ["error"]
        });
        return throwError(error);
      })
    );
  }
}
