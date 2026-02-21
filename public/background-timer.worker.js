// background-timer.worker.js
// This worker simply sends a tick message at a fixed interval.
// Web Workers run in a separate thread and are NOT throttled by the browser
// when the tab is inactive or minimized, unlike main thread setInterval/requestAnimationFrame.

const INTERVAL_MS = 100; // 10 updates per second (10 FPS) for background

let timerId = null;

self.onmessage = (e) => {
    if (e.data === 'start') {
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            self.postMessage('tick');
        }, INTERVAL_MS);
    } else if (e.data === 'stop') {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }
};