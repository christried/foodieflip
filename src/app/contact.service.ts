import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private httpClient = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  sendMessage(payload: ContactPayload) {
    return this.httpClient.post(`${this.apiBaseUrl}/api/contact`, payload).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error('Kontaktnachricht konnte nicht gesendet werden'));
      }),
    );
  }
}
