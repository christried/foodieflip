import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        cancel_on_tap_outside?: boolean;
      }): void;
      prompt(): void;
    };
  };
}

interface GoogleWindow extends Window {
  google?: GoogleIdentity;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private isInitialized = false;
  private pendingResolve: ((credential: string) => void) | null = null;
  private pendingReject: ((error: Error) => void) | null = null;
  private pendingTimeoutId: number | null = null;

  async preload(): Promise<void> {
    await this.ensureInitialized();
  }

  async requestCredential(): Promise<string> {
    if (!this.isBrowser) {
      throw new Error('Google-Anmeldung ist nur im Browser verfügbar.');
    }

    await this.ensureInitialized();

    const googleIdentity = this.getGoogleIdentity();

    if (!googleIdentity) {
      throw new Error('Google Identity ist nicht verfügbar.');
    }

    if (this.pendingReject) {
      this.pendingReject(new Error('Google-Anmeldung wurde neu gestartet.'));
      this.clearPendingRequest();
    }

    return new Promise<string>((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      this.pendingTimeoutId = window.setTimeout(() => {
        this.rejectPendingRequest('Google-Anmeldung wurde abgebrochen oder nicht abgeschlossen.');
      }, 30000);

      googleIdentity.accounts.id.prompt();
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isBrowser || this.isInitialized) {
      return;
    }

    const googleClientId = environment.googleClientId?.trim();

    if (!googleClientId) {
      throw new Error(
        'Google Client ID fehlt in den Umgebungsvariablen von Angular (environment.ts).',
      );
    }

    const googleIdentity = this.getGoogleIdentity();

    if (!googleIdentity) {
      throw new Error('Google Identity Script wurde nicht geladen (siehe src/index.html).');
    }

    googleIdentity.accounts.id.initialize({
      client_id: googleClientId,
      callback: this.handleCredentialResponse,
      cancel_on_tap_outside: true,
    });

    this.isInitialized = true;
  }

  private handleCredentialResponse = (response: GoogleCredentialResponse): void => {
    const credential = response.credential?.trim();

    if (!credential) {
      this.rejectPendingRequest('Google-Anmeldedaten konnten nicht verarbeitet werden.');
      return;
    }

    this.resolvePendingRequest(credential);
  };

  private getGoogleIdentity(): GoogleIdentity | undefined {
    if (!this.isBrowser) {
      return undefined;
    }

    return (window as GoogleWindow).google;
  }

  private resolvePendingRequest(credential: string): void {
    const resolve = this.pendingResolve;

    this.clearPendingRequest();

    if (!resolve) {
      return;
    }

    resolve(credential);
  }

  private rejectPendingRequest(message: string): void {
    const reject = this.pendingReject;

    this.clearPendingRequest();

    if (!reject) {
      return;
    }

    reject(new Error(message));
  }

  private clearPendingRequest(): void {
    if (this.pendingTimeoutId !== null) {
      window.clearTimeout(this.pendingTimeoutId);
    }

    this.pendingTimeoutId = null;
    this.pendingResolve = null;
    this.pendingReject = null;
  }
}
