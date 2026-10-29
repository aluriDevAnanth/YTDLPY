/**
 * Mock Service / API Provider: mockMediaElement
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockMediaElementEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockMediaElement dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockmediaelement = () => {
  return {
    name: 'mockMediaElement',
    isMocked: true,
    reset: () => true
  };
};
