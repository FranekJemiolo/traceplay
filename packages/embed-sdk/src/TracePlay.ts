import { TracePlayConfig, TracePlayOptions } from './types';

export class TracePlay {
  private config: TracePlayConfig;
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;

  constructor(config: TracePlayConfig) {
    this.config = {
      mode: 'lesson',
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      ...config,
    };
    
    // In demo mode, disable iframe mounting to prevent API calls
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      console.warn('TracePlay SDK: Demo mode detected - iframe mounting disabled');
    }
  }

  mount(container: string | HTMLElement, options?: TracePlayOptions): void {
    // Prevent iframe mounting in demo mode
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      console.warn('TracePlay SDK: Cannot mount iframe in demo mode');
      return;
    }

    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      throw new Error('Container not found');
    }

    this.iframe = document.createElement('iframe');
    this.iframe.src = this.buildEmbedUrl(options);
    this.iframe.style.width = options?.width || '100%';
    this.iframe.style.height = options?.height || '600px';
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '8px';

    this.container.appendChild(this.iframe);
  }

  loadLesson(lessonId: string): void {
    if (!this.iframe) {
      throw new Error('TracePlay not mounted');
    }

    const url = new URL(this.iframe.src);
    url.searchParams.set('lessonId', lessonId);
    this.iframe.src = url.toString();
  }

  joinClassroom(sessionId: string): void {
    if (!this.iframe) {
      throw new Error('TracePlay not mounted');
    }

    const url = new URL(this.iframe.src);
    url.searchParams.set('sessionId', sessionId);
    url.searchParams.set('mode', 'classroom');
    this.iframe.src = url.toString();
  }

  destroy(): void {
    if (this.iframe && this.container) {
      this.container.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  private buildEmbedUrl(options?: TracePlayOptions): string {
    const url = new URL(this.config.apiUrl!);
    url.pathname = '/embed';
    url.searchParams.set('apiKey', this.config.apiKey);
    url.searchParams.set('mode', this.config.mode!);
    
    if (options?.theme) {
      url.searchParams.set('theme', options.theme);
    }

    return url.toString();
  }
}
