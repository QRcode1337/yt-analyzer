import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'yt-analyzer',
  eventKey: process.env.INNGEST_EVENT_KEY,
})

