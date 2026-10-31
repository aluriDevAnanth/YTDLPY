/**
 * Mock Service / API Provider: mockNavigatorOnline
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockNavigatorOnlineEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockNavigatorOnline dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMocknavigatoronline = () => {
  return {
    name: 'mockNavigatorOnline',
    isMocked: true,
    reset: () => true
  };
};
