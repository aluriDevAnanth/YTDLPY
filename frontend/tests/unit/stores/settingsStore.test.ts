import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from 'src/store/useAppStore'
import { DUMMY_USERS_10 } from '../../fixtures/dataFactories'

describe('Settings Store Slice Unit Tests with 10 Datasets', () => {
  beforeEach(() => {
    useAppStore.setState({ settings: null, viewMode: 'grid' })
  })

  DUMMY_USERS_10.forEach((user, index) => {
    it(`should update and sync settings for user config #${index}`, () => {
      useAppStore.getState().setSettings(user.settings as any)

      const state = useAppStore.getState()
      expect(state.settings?.default_format).toBe(user.settings.default_format)
      expect(state.settings?.cookies_browser).toBe(user.settings.cookies_browser)
      expect(state.settings?.cookies_source).toBe(user.settings.cookies_source)
    })
  })

  it('should toggle viewMode between grid and table', () => {
    useAppStore.getState().setViewMode('table')
    expect(useAppStore.getState().viewMode).toBe('table')

    useAppStore.getState().setViewMode('grid')
    expect(useAppStore.getState().viewMode).toBe('grid')
  })
})
