import { createClient } from '@supabase/supabase-js'

export default class Database {
  DATABASE_URL: any = process.env.SUPABASE_URL;
  DATABASE_KEY: any = process.env.SUPABASE_ANON_KEY;
  database: any;
  connection: any;
  constructor() {
    // this.database = this.connect()
  }

  async connect() {
    this.connection = await createClient<any>(this.DATABASE_URL || '', this.DATABASE_KEY || '', {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })

    // let { data: channels, error } = await this.connection
    //   .from('channels')
    //   .select('*')

    //   console.log('AQUIIIIII', channels, error)
  }
}
// Create a single supabase client for interacting with your database
// const supabase = createClient<any>(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
//   realtime: {
//     params: {
//       eventsPerSecond: 10,
//     },
//   },
// })
// console.log("DATABASE ", Database)


// Channel name can be any string.
// Create channels with the same name for both the broadcasting and receiving clients.
// const channel = supabase.channel('room1')

// channel.subscribe((status) => {
//   if (status === 'SUBSCRIBED') {
//     // now you can start broadcasting cursor positions
//     setInterval(() => {
//       channel.send({
//         type: 'broadcast',
//         event: 'cursor-pos',
//         payload: { x: Math.random(), y: Math.random() },
//       })
//       console.log(status)
//     }, 100)
//   }
// })

// export default supabase