import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DevFeedbackDialog } from '../dialogs/dev-feedback-dialog/dev-feedback-dialog';
import { DOCUMENT } from '@angular/common';

type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  themeMode = signal<ThemeMode>('system');
  themeIcon = signal<string>('brightness_auto');

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('foodieflip-theme') as ThemeMode | null;
    if (saved) {
      this.themeMode.set(saved);
      this.applyTheme(saved);
    }
  }

  toggleTheme() {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(this.themeMode());
    const next = modes[(currentIndex + 1) % modes.length];
    this.themeMode.set(next);
    this.applyTheme(next);
    if (this.isBrowser) {
      localStorage.setItem('foodieflip-theme', next);
    }
  }

  private applyTheme(mode: ThemeMode) {
    const body = this.document.body;
    body.classList.remove('dark-mode', 'light-mode');

    switch (mode) {
      case 'dark':
        body.classList.add('dark-mode');
        this.themeIcon.set('dark_mode');
        break;
      case 'light':
        body.classList.add('light-mode');
        this.themeIcon.set('light_mode');
        break;
      default:
        this.themeIcon.set('brightness_auto');
        break;
    }
  }

  openDevFeedbackDialog() {
    this.dialog.open(DevFeedbackDialog, {
      height: '46rem',
      width: '34.5rem',
    });
  }
}
