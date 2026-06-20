import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, ElementRef, viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LibraryStore } from '@sms/library/data-access';

@Component({
  selector: 'sms-read',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="reader">

  @if (store.selectedResource(); as res) {
    <!-- Toolbar -->
    <header class="reader-toolbar">
      <a [routerLink]="['/library/resource', res.publicId]" class="tb-btn" title="Retour au détail">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <div class="tb-title">
        <span class="tb-type" [class]="'type-' + res.type.toLowerCase()">{{ res.type }}</span>
        <span class="tb-name">{{ res.titre }}</span>
      </div>
      <div class="tb-spacer"></div>
      @if (res.disponibleEnLigne && res.urlFichier) {
        <a [href]="res.urlFichier" target="_blank" class="tb-btn" title="Ouvrir / Télécharger">
          <mat-icon>download</mat-icon>
        </a>
        <button class="tb-btn" (click)="toggleFullscreen()" title="Plein écran">
          <mat-icon>fullscreen</mat-icon>
        </button>
      }
    </header>

    <!-- Corps -->
    <div class="reader-body" #viewerBody>
      @if (!res.disponibleEnLigne) {
        <div class="reader-empty">
          <mat-icon>cloud_off</mat-icon>
          <h3>Version électronique indisponible</h3>
          <p>Cette ressource n'est consultable qu'en version papier.</p>
          <a [routerLink]="['/library/borrow', res.publicId]" class="btn btn-primary"><mat-icon>bookmark_add</mat-icon> Emprunter la version papier</a>
        </div>
      } @else if (res.type === 'AUDIO') {
        <div class="audio-wrap">
          <mat-icon class="audio-art">headphones</mat-icon>
          <h3>{{ res.titre }}</h3>
          <audio controls [src]="res.urlFichier" class="audio-player"></audio>
        </div>
      } @else if (safeUrl()) {
        <iframe class="viewer-frame" [src]="safeUrl()" [title]="res.titre" referrerpolicy="no-referrer"></iframe>
      }
    </div>

    <!-- Bandeau format -->
    @if (res.disponibleEnLigne && res.formatNumerique) {
      <footer class="reader-footer">
        <mat-icon>description</mat-icon> Format : {{ res.formatNumerique }}
        @if (res.nombrePages) { · {{ res.nombrePages }} pages }
      </footer>
    }
  } @else {
    <div class="reader-loading"><mat-icon class="spin">sync</mat-icon><p>Ouverture du lecteur…</p></div>
  }
</div>
  `,
  styles: [`
.reader { display: flex; flex-direction: column; height: calc(100vh - var(--topbar-height, 64px)); background: #1e293b; }
.reader-toolbar { display: flex; align-items: center; gap: 10px; padding: 0 16px; height: 56px; background: #0f172a; color: #fff; flex-shrink: 0; }
.tb-btn { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 8px; border: none; background: rgba(255,255,255,.08); color: #fff; cursor: pointer; text-decoration: none; transition: background .2s; }
.tb-btn:hover { background: rgba(255,255,255,.18); }
.tb-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tb-type { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; color: #fff; }
.type-livre { background: #6366f1; } .type-pdf { background: #EF4444; } .type-video { background: #10B981; } .type-audio { background: #F59E0B; } .type-lien { background: #3B82F6; }
.tb-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 420px; }
.tb-spacer { flex: 1; }

.reader-body { flex: 1; overflow: hidden; display: flex; }
.viewer-frame { width: 100%; height: 100%; border: none; background: #fff; }

.audio-wrap { margin: auto; text-align: center; color: #fff; padding: 40px; }
.audio-art { font-size: 96px !important; height: 96px !important; width: 96px !important; color: #6366f1; margin-bottom: 16px; }
.audio-wrap h3 { margin: 0 0 20px; font-weight: 600; }
.audio-player { width: 380px; max-width: 80vw; }

.reader-empty { margin: auto; text-align: center; color: #cbd5e1; padding: 40px; }
.reader-empty mat-icon { font-size: 64px !important; height: 64px !important; width: 64px !important; color: #64748b; margin-bottom: 16px; }
.reader-empty h3 { color: #fff; margin: 0 0 8px; }
.reader-empty p { margin: 0 0 20px; font-size: 14px; }

.reader-footer { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #0f172a; color: #94a3b8; font-size: 12px; flex-shrink: 0; }
.reader-footer mat-icon { font-size: 16px !important; height: 16px !important; width: 16px !important; }

.reader-loading { margin: auto; text-align: center; color: #cbd5e1; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; font-size: 36px !important; height: 36px !important; width: 36px !important; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover { background: #4f46e5; }
  `],
})
export class ReadComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly viewerBody = viewChild<ElementRef<HTMLElement>>('viewerBody');

  protected readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const res = this.store.selectedResource();
    if (!res?.disponibleEnLigne || !res.urlFichier) return null;
    if (res.type === 'AUDIO') return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(res.urlFichier);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId');
    if (id) this.store.loadResource(id);
  }

  protected toggleFullscreen(): void {
    const el = this.viewerBody()?.nativeElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }
}
