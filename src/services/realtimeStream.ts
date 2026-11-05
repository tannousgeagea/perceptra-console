// services/realtimeStream.ts
//
// One server-sent-events stream per tab: the project's (GET /projects/{id}/events,
// which also carries the user's notifications), or outside a project the
// user's own (GET /notifications/events).
// Read with fetch instead of EventSource so it carries the same auth and
// organization headers as every other request (and refreshes the token on
// 401 through apiFetch). Reconnects with backoff; a silent connection (no
// data or keep-alive ping for 45s) is treated as dead and replaced.

import { apiFetch } from '@/services/apiClient';

export interface RealtimeEvent<T = unknown> {
  type: string;
  data: T;
  /** User id that made the change, when known. */
  actor?: string | number | null;
  /** Tab (X-Client-ID) whose request caused it, when known. */
  origin?: string | null;
  ts?: number;
}

export type StreamStatus = 'connecting' | 'live' | 'reconnecting' | 'unavailable';

interface StreamHandlers {
  onEvent: (event: RealtimeEvent) => void;
  onStatus: (status: StreamStatus) => void;
}

/** The server pings every 15s; three missed pings means the connection is gone. */
const SILENCE_LIMIT_MS = 45_000;
const MAX_BACKOFF_MS = 30_000;
/** A stream that lasted this long was healthy: the next reconnect starts fresh. */
const HEALTHY_STREAM_MS = 10_000;

/** A project's stream: its events, presence, and the user's own notifications. */
export const openProjectStream = (projectId: string, handlers: StreamHandlers) =>
  openEventStream(`/api/v1/projects/${projectId}/events`, handlers);

/** Outside a project: only the user's own notifications. */
export const openUserStream = (handlers: StreamHandlers) =>
  openEventStream('/api/v1/notifications/events', handlers);

/** Opens an SSE stream; returns a function that closes it for good. */
function openEventStream(path: string, { onEvent, onStatus }: StreamHandlers): () => void {
  let stopped = false;
  let attempt = 0;
  let controller: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let silenceTimer: ReturnType<typeof setTimeout> | undefined;

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => controller?.abort(), SILENCE_LIMIT_MS);
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    // First retry is quick (the server ends streams on purpose every ~25 min).
    const base = attempt === 0 ? 500 : Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt);
    const delay = base * (0.5 + Math.random() / 2);
    if (attempt > 0) onStatus('reconnecting');
    attempt += 1;
    retryTimer = setTimeout(connect, delay);
  };

  const dispatch = (frame: string) => {
    const data = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!data) return; // comment (": ping") or "retry:" line
    try {
      onEvent(JSON.parse(data) as RealtimeEvent);
    } catch {
      // malformed frame: ignore
    }
  };

  async function connect() {
    if (stopped) return;
    controller = new AbortController();
    if (attempt === 0) onStatus('connecting');
    try {
      const response = await apiFetch(path, {
        signal: controller.signal,
        headers: { Accept: 'text/event-stream' },
        cache: 'no-store',
      });
      if (response.status === 403 || response.status === 404) {
        onStatus('unavailable'); // no access (or not deployed yet): don't hammer the server
        return;
      }
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const openedAt = Date.now();
      onStatus('live');
      resetSilenceTimer();
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        resetSilenceTimer();
        buffer += value.replace(/\r\n/g, '\n');
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          dispatch(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf('\n\n');
        }
      }
      // Ended by the server. Streams that die right away keep backing off.
      if (Date.now() - openedAt >= HEALTHY_STREAM_MS) attempt = 0;
    } catch {
      // network error, abort (silence), or server error: retry below
    } finally {
      clearTimeout(silenceTimer);
    }
    scheduleReconnect();
  }

  void connect();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    clearTimeout(silenceTimer);
    controller?.abort();
  };
}
