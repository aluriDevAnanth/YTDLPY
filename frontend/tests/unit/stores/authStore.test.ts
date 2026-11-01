import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from 'src/store/useAppStore'
import { DUMMY_USERS_10 } from '../../fixtures/dataFactories'

describe('Auth Store Slices Unit Tests with 10 Datasets', () => {
  beforeEach(() => {
    useAppStore.getState().logout()
  })

  DUMMY_USERS_10.forEach((user, index) => {
    it(`should set authentication state and settings for user dataset #${index}: ${user.username}`, () => {
      const dummyToken = `jwt_token_sample_${user.id}`
      
      // 1. setAuth
      useAppStore.getState().setAuth(dummyToken, user as any)
      
      const state = useAppStore.getState()
      expect(state.token).toBe(dummyToken)
      expect(state.user?.id).toBe(user.id)
      expect(state.user?.username).toBe(user.username)
      expect(state.user?.role).toBe(user.role)
      expect(state.settings?.default_format).toBe(user.settings.default_format)
      expect(state.isAuthOpen).toBe(false)

      // 2. update settings
      const updatedFormat = 'WORSTAUDIO'
      useAppStore.getState().setSettings({
        ...user.settings,
        default_format: updatedFormat,
      } as any)

      expect(useAppStore.getState().settings?.default_format).toBe(updatedFormat)

      // 3. logout
      useAppStore.getState().logout()
      const loggedOut = useAppStore.getState()
      expect(loggedOut.token).toBeNull()
      expect(loggedOut.user).toBeNull()
      expect(loggedOut.settings).toBeNull()
      expect(loggedOut.isAuthOpen).toBe(true)
    })
  })
})
