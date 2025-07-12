export interface AgUiConnectorOptions {
  transport: 'iframe' | 'websocket';
  iframeSelector?: string;
  websocketUrl?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface AgUiConnector {
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  disconnect: () => void;
}

export interface AgentResponse {
  id: string;
  type: 'text' | 'structured';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface StructuredContent {
  type: 'table' | 'chart' | 'form' | 'list';
  data: any;
  schema?: Record<string, any>;
}

class IframeConnector implements AgUiConnector {
  private iframe: HTMLIFrameElement | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected = false;

  constructor(private options: AgUiConnectorOptions) {
    this.initialize();
  }

  private initialize() {
    if (this.options.transport !== 'iframe' || !this.options.iframeSelector) {
      throw new Error('Iframe selector is required for iframe transport');
    }

    this.iframe = document.querySelector(this.options.iframeSelector);
    if (!this.iframe) {
      throw new Error(`Iframe not found: ${this.options.iframeSelector}`);
    }

    this.setupMessageListener();
    this.isConnected = true;
    this.options.onConnect?.();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.source !== this.iframe?.contentWindow) {
        return;
      }

      const { type, data } = event.data;
      this.notifyListeners(type, data);
    });
  }

  private notifyListeners(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  emit(event: string, data?: any) {
    if (!this.isConnected || !this.iframe?.contentWindow) {
      console.warn('AG-UI Connector not connected');
      return;
    }

    this.iframe.contentWindow.postMessage({
      type: event,
      data: data || {},
    }, '*');
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  disconnect() {
    this.isConnected = false;
    this.eventListeners.clear();
    this.options.onDisconnect?.();
  }
}

export function createAgUiConnector(options: AgUiConnectorOptions): AgUiConnector {
  if (options.transport === 'iframe') {
    return new IframeConnector(options);
  }
  throw new Error(`Unsupported transport: ${options.transport}`);
}