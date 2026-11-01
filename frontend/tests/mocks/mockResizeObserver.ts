/**
 * Mock Service / API Provider: mockResizeObserver
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockResizeObserverEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockResizeObserver dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockresizeobserver = () => {
  return {
    name: 'mockResizeObserver',
    isMocked: true,
    reset: () => true
  };
};
