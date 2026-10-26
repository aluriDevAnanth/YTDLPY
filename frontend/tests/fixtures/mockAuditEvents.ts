/**
 * Fixture: mockAuditEvents
 * Exports 10 distinct standard datasets for test isolation and component mocking.
 */

export const mockAuditEventsDatasets = Array.from({ length: 10 }, (_, i) => ({
  id: `mockauditevents_${i + 1}`,
  name: `Fixture mockAuditEvents item ${i + 1}`,
  index: i + 1,
  timestamp: new Date(Date.UTC(2026, 8, 27, 12, i, 0)).toISOString(),
  meta: {
    flag: i % 2 === 0,
    rating: (i + 1) * 0.5,
    tag: `tag_${i + 1}`
  }
}));

export const defaultMockauditevents = mockAuditEventsDatasets[0];
