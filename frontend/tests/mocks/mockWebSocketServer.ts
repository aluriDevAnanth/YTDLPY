/**
 * Mock Service / API Provider: mockWebSocketServer
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockWebSocketServerEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockWebSocketServer dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockwebsocketserver = () => {
  return {
    name: 'mockWebSocketServer',
    isMocked: true,
    reset: () => true
  };
};
