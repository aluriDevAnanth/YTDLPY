/**
 * Mock Service / API Provider: mockPerformanceObserver
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockPerformanceObserverEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockPerformanceObserver dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockperformanceobserver = () => {
  return {
    name: 'mockPerformanceObserver',
    isMocked: true,
    reset: () => true
  };
};
