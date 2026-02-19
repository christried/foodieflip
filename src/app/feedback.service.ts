import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private httpClient = inject(HttpClient);

  sendFeedback(name: string, feedback: string) {
    return this.httpClient.post('http://localhost:3000/api/feedback', { name, feedback }).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error('Could not send feedback'));
      }),
    );
  }
}
