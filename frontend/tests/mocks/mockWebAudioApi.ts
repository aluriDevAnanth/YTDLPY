/**
 * Mock Service / API Provider: mockWebAudioApi
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockWebAudioApiEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockWebAudioApi dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockwebaudioapi = () => {
  return {
    name: 'mockWebAudioApi',
    isMocked: true,
    reset: () => true
  };
};
