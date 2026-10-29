/**
 * Mock Service / API Provider: mockIntersectionObserver
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockIntersectionObserverEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockIntersectionObserver dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockintersectionobserver = () => {
  return {
    name: 'mockIntersectionObserver',
    isMocked: true,
    reset: () => true
  };
};
