export type Usage = { tokens: number; window: number; percent: number }

declare module 'claude-code' {
  interface PluginState {
    'token-bar': { usage: Usage | null }
  }
}
