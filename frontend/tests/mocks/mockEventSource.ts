/**
 * Mock Service / API Provider: mockEventSource
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockEventSourceEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockEventSource dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockeventsource = () => {
  return {
    name: 'mockEventSource',
    isMocked: true,
    reset: () => true
  };
};
