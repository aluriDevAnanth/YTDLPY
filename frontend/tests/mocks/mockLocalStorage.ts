/**
 * Mock Service / API Provider: mockLocalStorage
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockLocalStorageEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockLocalStorage dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMocklocalstorage = () => {
  return {
    name: 'mockLocalStorage',
    isMocked: true,
    reset: () => true
  };
};
