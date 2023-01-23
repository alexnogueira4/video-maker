// import "./config/env"
// import Database from './config/database'
import VideoMaker from './api/videomaker'

// const database = new Database();
  try {
    new VideoMaker({
      // connection: database.connection
    })
    
  } catch (error) {
      console.log("FINALMENT", error)
  }
//   // await database.connect()
