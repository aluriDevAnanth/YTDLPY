/**
 * Mock Service / API Provider: mockSessionStorage
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockSessionStorageEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockSessionStorage dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMocksessionstorage = () => {
  return {
    name: 'mockSessionStorage',
    isMocked: true,
    reset: () => true
  };
};
