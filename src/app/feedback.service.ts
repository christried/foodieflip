import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private httpClient = inject(HttpClient);

  sendFeedback(name: string, feedback: string) {
    return this.httpClient.post(`${environment.apiBaseUrl}/api/feedback`, { name, feedback }).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error('Could not send feedback'));
      }),
    );
  }
}
