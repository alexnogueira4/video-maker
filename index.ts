import "./config/env"
import Database from './config/database'
import VideoMaker from './api/videomaker'

const database = new Database();
(async () => {
  try {
    await database.connect()
    new VideoMaker({
      connection: database.connection,
      currentShowId: 1
    })
  } catch (error) {
    console.log("FINALMENT", error)
  }
})()
