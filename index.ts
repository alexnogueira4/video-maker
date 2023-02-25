import "./config/env"
import Database from './config/database'
import VideoMaker from './api/videomaker'
import Receiver from './api/receiver'
import Logger from './config/logging'
const logger = new Logger();

new Receiver({
  callback: async ({ currentShowId }) => {
    logger.info({
      message: "starting video-maker",
      currentShowId
    })

    const database = new Database();
    if (currentShowId) {
      await database.connect()
      const videomaker = new VideoMaker({
        connection: database.connection,
        currentShowId: currentShowId,
        logger
      })
      await videomaker.startCompiler()
    }
  },
  errorHandler: (error) => {
    logger.error(error)
  },
  queue: 'video-maker'
})

// const database = new Database();
// (async () => {
//   try {
//     await database.connect()
//     const videomaker = new VideoMaker({
//       connection: database.connection,
//       currentShowId: 1,
//       logger
//     })
//       await videomaker.startCompiler()
//   } catch (error) {
//     console.log("FINALMENT", error)
//   }
// })()
