/**
 * Mock Service / API Provider: mockCanvasContext
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockCanvasContextEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockCanvasContext dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockcanvascontext = () => {
  return {
    name: 'mockCanvasContext',
    isMocked: true,
    reset: () => true
  };
};
