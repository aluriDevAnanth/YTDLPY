/**
 * Mock Service / API Provider: mockFileReader
 * Provides isolated mock implementations across 10 distinct test environments.
 */

export const mockFileReaderEnvironments = Array.from({ length: 10 }, (_, i) => ({
  envId: `env_${i + 1}`,
  name: `mockFileReader dataset profile ${i + 1}`,
  latencyMs: i * 5,
  status: 'active'
}));

export const setupMockfilereader = () => {
  return {
    name: 'mockFileReader',
    isMocked: true,
    reset: () => true
  };
};
