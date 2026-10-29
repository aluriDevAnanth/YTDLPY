/**
 * Mock Service / API Provider: mockClipboardApi
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockClipboardApiEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockClipboardApi dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockclipboardapi = () => {
  return {
    name: 'mockClipboardApi',
    isMocked: true,
    reset: () => true
  };
};
