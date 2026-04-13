import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, finalize, map, Observable, of, take, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthSessionResponse, AuthUser, UsernameUpdatePayload } from './auth.model';

interface AuthErrorResponse {
  error: string;
}

interface AuthLogoutResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly user = signal<AuthUser | null>(null);
  readonly needsUsername = signal(false);
  readonly isBootstrapping = signal(false);
  readonly isAuthenticated = computed(() => this.user() !== null);
  private readonly isBootstrapping$ = toObservable(this.isBootstrapping);

  waitForBootstrapCompletion(): Observable<void> {
    if (!this.isBootstrapping()) {
      return of(undefined);
    }

    return this.isBootstrapping$.pipe(
      filter((value) => !value),
      take(1),
      map(() => undefined),
    );
  }

  bootstrapSession(): Observable<AuthSessionResponse | null> {
    this.isBootstrapping.set(true);

    return this.httpClient.get<AuthSessionResponse>(`${this.apiBaseUrl}/api/auth/me`).pipe(
      tap({
        next: (response) => this.applyAuthResponse(response),
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.clearAuthState();
          return of(null);
        }

        return throwError(() => this.toError(error, 'Sitzung konnte nicht geladen werden'));
      }),
      finalize(() => this.isBootstrapping.set(false)),
    );
  }

  loginWithGoogleCredential(credential: string): Observable<AuthSessionResponse> {
    const trimmedCredential = credential.trim();

    if (!trimmedCredential) {
      return throwError(() => new Error('Google-Anmeldedaten fehlen.'));
    }

    return this.httpClient
      .post<AuthSessionResponse>(`${this.apiBaseUrl}/api/auth/google`, {
        credential: trimmedCredential,
      })
      .pipe(
        tap({
          next: (response) => this.applyAuthResponse(response),
        }),
        catchError((error: unknown) => {
          return throwError(() => this.toError(error, 'Google-Anmeldung fehlgeschlagen'));
        }),
      );
  }

  updateUsername(username: string): Observable<AuthSessionResponse> {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return throwError(() => new Error('Benutzername darf nicht leer sein.'));
    }

    const payload: UsernameUpdatePayload = {
      username: normalizedUsername,
    };

    return this.httpClient
      .patch<AuthSessionResponse>(`${this.apiBaseUrl}/api/auth/username`, payload)
      .pipe(
        tap({
          next: (response) => this.applyAuthResponse(response),
        }),
        catchError((error: unknown) => {
          return throwError(() =>
            this.toError(error, 'Benutzername konnte nicht gespeichert werden'),
          );
        }),
      );
  }

  logout(): Observable<void> {
    return this.httpClient.post<AuthLogoutResponse>(`${this.apiBaseUrl}/api/auth/logout`, {}).pipe(
      tap({
        next: () => this.clearAuthState(),
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.clearAuthState();
          return of(undefined);
        }

        return throwError(() => this.toError(error, 'Abmeldung fehlgeschlagen'));
      }),
    );
  }

  clearAuthState(): void {
    this.user.set(null);
    this.needsUsername.set(false);
  }

  private applyAuthResponse(response: AuthSessionResponse): void {
    this.user.set(response.user);
    this.needsUsername.set(response.needsUsername);
  }

  private toError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      return new Error(this.getApiErrorMessage(error) ?? fallbackMessage);
    }

    return new Error(fallbackMessage);
  }

  private getApiErrorMessage(error: HttpErrorResponse): string | undefined {
    const payload = error.error;

    if (payload && typeof payload === 'object' && 'error' in payload) {
      const apiError = payload as AuthErrorResponse;

      if (typeof apiError.error === 'string' && apiError.error.trim().length > 0) {
        return apiError.error;
      }
    }

    return undefined;
  }
}
