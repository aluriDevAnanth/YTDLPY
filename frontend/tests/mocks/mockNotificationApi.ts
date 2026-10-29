/**
 * Mock Service / API Provider: mockNotificationApi
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockNotificationApiEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockNotificationApi dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMocknotificationapi = () => {
  return {
    name: 'mockNotificationApi',
    isMocked: true,
    reset: () => true
  };
};
