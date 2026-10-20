import { describe, it, expect } from 'vitest'
import { postSlot, publishDelayMs, scheduledPostTime } from './plan'

const times = ['07:00', '10:00', '13:30', '16:30', '19:30', '22:00']
const dhaka = (day: number, hhmm: string) => new Date(Date.UTC(2026, 9, day, Number(hhmm.slice(0, 2)) - 6, Number(hhmm.slice(3))))

describe('scheduled post time', () => {
  it('targets the slot a run started for, early or late', () => {
    expect(scheduledPostTime(dhaka(21, '21:30'), times)).toEqual(dhaka(21, '22:00'))
    expect(scheduledPostTime(dhaka(21, '22:25'), times)).toEqual(dhaka(21, '22:00'))
    expect(scheduledPostTime(dhaka(21, '06:30'), times)).toEqual(dhaka(21, '07:00'))
    expect(scheduledPostTime(dhaka(21, '12:58'), times)).toEqual(dhaka(21, '13:30'))
  })

  it('picks the same slot as the post plan', () => {
    for (const t of times) expect(postSlot(scheduledPostTime(dhaka(22, t), times), times)).toBe(times.indexOf(t))
  })

  it('waits until a few minutes before the slot, or posts at once when late', () => {
    expect(publishDelayMs(dhaka(21, '21:45'), dhaka(21, '22:00'), 3 * 60_000)).toBe(12 * 60_000)
    expect(publishDelayMs(dhaka(21, '22:05'), dhaka(21, '22:00'), 3 * 60_000)).toBe(0)
  })
})
