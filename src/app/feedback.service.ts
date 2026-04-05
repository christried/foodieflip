import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private httpClient = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  sendFeedback(name: string, feedback: string) {
    return this.httpClient.post(`${this.apiBaseUrl}/api/feedback`, { name, feedback }).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error('Feedback konnte nicht gesendet werden'));
      }),
    );
  }
}
