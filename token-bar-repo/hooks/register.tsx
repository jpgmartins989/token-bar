import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Usage } from '../types'

const usageAtom = atom({ plugin: 'token-bar', key: 'usage' } as const, null)

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `${n}`)

async function refresh($: any) {
  const u = await $.session.usage()
  const c = u.context
  const usage: Usage = {
    tokens: c.tokens ?? 0,
    window: c.window,
    percent: c.percent ?? 0,
  }
  await update($, usageAtom, () => usage)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const usage = await read($, usageAtom)
    if (e.props.hasSurvey || usage === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const width = 30
    const filled = Math.min(width, Math.round((usage.percent / 100) * width))
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled)

    return (
      <Box>
        <Text dimColor>
          Tokens {bar} {usage.percent}% ({fmt(usage.tokens)} / {fmt(usage.window)})
        </Text>
      </Box>
    )
  })
}
