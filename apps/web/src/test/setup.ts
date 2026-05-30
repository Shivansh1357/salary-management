import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mantine relies on matchMedia and ResizeObserver, which jsdom does not provide.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Assign directly (not via vi.stubGlobal) so per-test unstubAllGlobals() keeps it.
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
