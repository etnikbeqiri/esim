<?php

namespace App\Services\Streaming;

use Closure;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Server-Sent Events (SSE) Stream Handler
 *
 * A professional, reusable SSE implementation that handles:
 * - Event formatting and delivery
 * - Connection lifecycle management
 * - Heartbeat/keepalive signals
 * - Reconnection support via Last-Event-ID
 * - Graceful timeout and disconnection
 * - Output buffering control
 */
class SseStream
{
    protected int $eventId = 0;
    protected int $retryMs = 3000;
    protected int $heartbeatIntervalSeconds = 15;
    protected int $maxDurationSeconds = 60;
    protected bool $connected = false;
    protected ?int $lastEventId = null;

    /**
     * Create a new SSE stream instance.
     */
    public function __construct(
        protected ?string $channel = null
    ) {}

    /**
     * Set the retry interval for client reconnection.
     */
    public function retry(int $milliseconds): static
    {
        $this->retryMs = $milliseconds;
        return $this;
    }

    /**
     * Set the heartbeat interval.
     */
    public function heartbeatInterval(int $seconds): static
    {
        $this->heartbeatIntervalSeconds = $seconds;
        return $this;
    }

    /**
     * Set the maximum connection duration.
     */
    public function maxDuration(int $seconds): static
    {
        $this->maxDurationSeconds = $seconds;
        return $this;
    }

    /**
     * Set the last event ID for reconnection support.
     */
    public function fromEventId(?int $eventId): static
    {
        $this->lastEventId = $eventId;
        return $this;
    }

    /**
     * Create and return the streamed response.
     *
     * @param Closure $handler Function that receives the stream and handles the logic
     *                         Signature: function(SseStream $stream): void
     */
    public function stream(Closure $handler): StreamedResponse
    {
        return new StreamedResponse(
            function () use ($handler) {
                $this->initialize();
                $handler($this);
                $this->terminate();
            },
            200,
            $this->getHeaders()
        );
    }

    /**
     * Create a polling-based stream that checks for updates at intervals.
     *
     * @param Closure $checker Function that checks for updates, returns data or null
     *                         Signature: function(): ?array
     * @param string $eventName Event name to emit when updates are found
     * @param int $intervalSeconds Polling interval in seconds
     */
    public function poll(Closure $checker, string $eventName = 'update', int $intervalSeconds = 1): StreamedResponse
    {
        return $this->stream(function (SseStream $stream) use ($checker, $eventName, $intervalSeconds) {
            $iterations = 0;
            $maxIterations = (int) ceil($this->maxDurationSeconds / $intervalSeconds);
            $lastHeartbeat = time();

            while ($iterations < $maxIterations) {
                // Check for updates
                $data = $checker();

                if ($data !== null) {
                    $stream->emit($eventName, $data);
                }

                // Send heartbeat if needed
                if ((time() - $lastHeartbeat) >= $this->heartbeatIntervalSeconds) {
                    $stream->heartbeat();
                    $lastHeartbeat = time();
                }

                // Check if client disconnected
                if ($stream->isDisconnected()) {
                    break;
                }

                sleep($intervalSeconds);
                $iterations++;
            }
        });
    }

    /**
     * Initialize the stream connection.
     */
    protected function initialize(): void
    {
        // CRITICAL: Close session to prevent blocking other requests
        // PHP sessions lock the session file, blocking all other requests from the same user
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        // Also close Laravel's session if available (safely check if it's started)
        try {
            if (function_exists('app') && app()->bound('session') && app('session')->isStarted()) {
                app('session')->save();
            }
        } catch (\Throwable) {
            // Session not available, that's fine for SSE
        }

        // Disable output buffering for immediate delivery
        $this->disableOutputBuffering();

        // Disable time limit for long-running connections
        set_time_limit(0);

        // Ignore user abort to handle cleanup
        ignore_user_abort(true);

        $this->connected = true;

        // Send retry interval
        $this->sendRaw("retry: {$this->retryMs}");

        // Send connected event
        $this->emit('connected', [
            'status' => 'connected',
            'channel' => $this->channel,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Terminate the stream connection gracefully.
     */
    protected function terminate(): void
    {
        if ($this->connected) {
            $this->emit('timeout', [
                'message' => 'Connection timeout, please reconnect',
                'timestamp' => now()->toIso8601String(),
            ]);
            $this->connected = false;
        }
    }

    /**
     * Emit an event with data.
     */
    public function emit(string $event, mixed $data, ?int $id = null): static
    {
        if (!$this->connected) {
            return $this;
        }

        $id = $id ?? ++$this->eventId;

        $this->sendRaw("id: {$id}");
        $this->sendRaw("event: {$event}");
        $this->sendData($data);
        $this->flush();

        return $this;
    }

    /**
     * Send a comment (for keepalive without event).
     */
    public function comment(string $text): static
    {
        if (!$this->connected) {
            return $this;
        }

        $this->sendRaw(": {$text}");
        $this->flush();

        return $this;
    }

    /**
     * Send a heartbeat event.
     */
    public function heartbeat(): static
    {
        return $this->emit('heartbeat', [
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Check if the client has disconnected.
     */
    public function isDisconnected(): bool
    {
        return connection_aborted() === 1;
    }

    /**
     * Check if the stream is still connected.
     */
    public function isConnected(): bool
    {
        return $this->connected && !$this->isDisconnected();
    }

    /**
     * Get the current event ID.
     */
    public function getCurrentEventId(): int
    {
        return $this->eventId;
    }

    /**
     * Get the last event ID from reconnection.
     */
    public function getLastEventId(): ?int
    {
        return $this->lastEventId;
    }

    /**
     * Send raw SSE formatted line.
     */
    protected function sendRaw(string $line): void
    {
        echo $line . "\n";
    }

    /**
     * Send data payload.
     */
    protected function sendData(mixed $data): void
    {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // SSE data must be single line, but we can split for readability
        // Each line of data must be prefixed with "data: "
        $this->sendRaw("data: {$json}");
        $this->sendRaw(""); // Empty line to signal end of event
    }

    /**
     * Flush output buffers.
     */
    protected function flush(): void
    {
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    /**
     * Disable output buffering.
     */
    protected function disableOutputBuffering(): void
    {
        // Clear all output buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        // Start a new buffer with implicit flush
        if (function_exists('apache_setenv')) {
            apache_setenv('no-gzip', '1');
        }

        ini_set('zlib.output_compression', '0');
        ini_set('implicit_flush', '1');
    }

    /**
     * Get the response headers for SSE.
     */
    protected function getHeaders(): array
    {
        return [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
            'Access-Control-Allow-Origin' => '*', // CORS support
        ];
    }

    /**
     * Create a new SSE stream instance statically.
     */
    public static function make(?string $channel = null): static
    {
        return new static($channel);
    }
}
