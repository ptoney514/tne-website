import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Mock API client for unit tests
vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(() => Promise.resolve([])),
    post: vi.fn(() => Promise.resolve({})),
    patch: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve()),
  },
}));

// Mock Neon Auth client for unit tests
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
    })),
    signIn: {
      email: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
    signOut: vi.fn(() => Promise.resolve()),
  },
}));

// Mock next/navigation for unit tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams()],
  usePathname: () => '/',
}));
