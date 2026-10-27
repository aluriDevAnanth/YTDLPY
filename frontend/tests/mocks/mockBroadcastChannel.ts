/**
 * Mock Service / API Provider: mockBroadcastChannel
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockBroadcastChannelEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockBroadcastChannel dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockbroadcastchannel = () => {
  return {
    name: 'mockBroadcastChannel',
    isMocked: true,
    reset: () => true
  };
};
