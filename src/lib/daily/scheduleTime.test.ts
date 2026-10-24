import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { load } from 'js-yaml'
import { join } from 'node:path'
import { dailyConfig } from './dailyConfig'
import { postSlot, scheduledPostTime } from './plan'

const times = ['07:00', '10:00', '13:30', '16:30', '19:30', '22:00']
const dhaka = (day: number, hhmm: string) => new Date(Date.UTC(2026, 9, day, Number(hhmm.slice(0, 2)) - 6, Number(hhmm.slice(3))))

describe('scheduled post time', () => {
  it('targets the slot a run started for, early or late', () => {
    expect(scheduledPostTime(dhaka(21, '22:00'), times)).toEqual(dhaka(21, '22:00'))
    expect(scheduledPostTime(dhaka(21, '21:55'), times)).toEqual(dhaka(21, '22:00'))
    expect(scheduledPostTime(dhaka(21, '22:25'), times)).toEqual(dhaka(21, '22:00'))
    expect(scheduledPostTime(dhaka(21, '13:25'), times)).toEqual(dhaka(21, '13:30'))
  })

  it('catches up a slot when GitHub starts the run very late instead of waiting for the next one', () => {
    expect(scheduledPostTime(dhaka(21, '14:46'), times)).toEqual(dhaka(21, '13:30'))
    expect(scheduledPostTime(dhaka(21, '00:40'), times)).toEqual(dhaka(20, '22:00'))
    expect(scheduledPostTime(dhaka(21, '04:00'), times)).toBeNull()
  })

  it('picks the same slot as the post plan', () => {
    for (const t of times) expect(postSlot(scheduledPostTime(dhaka(22, t), times)!, times)).toBe(times.indexOf(t))
  })

})

describe('daily workflow triggers', () => {
  const workflow = readFileSync(join(process.cwd(), '.github/workflows/daily-reel.yml'), 'utf8')
  const triggers = [...workflow.matchAll(/cron: '([\d,]+) ([\d,*]+) \* \* \*'/g)].flatMap(([, minutes, hours]) =>
    (hours === '*' ? Array.from({ length: 24 }, (_, h) => String(h)) : hours!.split(',')).flatMap((h) => minutes!.split(',').map((m) => new Date(Date.UTC(2026, 9, 22, Number(h), Number(m))))),
  )

  it('checks twice an hour, so every slot gets several backup chances within its catch-up window', () => {
    for (const time of dailyConfig.postTimes) {
      const slot = dhaka(22, time)
      const backups = triggers.filter((t) => scheduledPostTime(t, dailyConfig.postTimes)?.getTime() === slot.getTime())
      expect(backups.length, time).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('workflow files', () => {
  const dir = join(process.cwd(), '.github/workflows')

  it('are all valid YAML so GitHub can run them', () => {
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
      expect(() => load(readFileSync(join(dir, file), 'utf8')), file).not.toThrow()
    }
  })

  it('keep the manual trigger and its inputs on the daily workflow', () => {
    const workflow = load(readFileSync(join(dir, 'daily-reel.yml'), 'utf8')) as { on: { workflow_dispatch: { inputs: Record<string, unknown> } } }
    expect(Object.keys(workflow.on.workflow_dispatch.inputs)).toEqual(expect.arrayContaining(['slot', 'platforms', 'mode', 'dua', 'surah']))
  })
})
