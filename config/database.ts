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
      // realtime: {
      //   params: {
      //     eventsPerSecond: 10,
      //   },
      // },
    })
  }
}