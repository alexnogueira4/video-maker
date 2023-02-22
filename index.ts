import "./config/env"
import Database from './config/database'
import VideoMaker from './api/videomaker'
import Receiver from './api/receiver'

new Receiver({
  callback: async ({ currentShowId }) => {
    console.log('chamou o callback', currentShowId)
    const database = new Database();
    if (currentShowId) {
      await database.connect()
      const videomaker = new VideoMaker({
        connection: database.connection,
        currentShowId: currentShowId
      })
      await videomaker.startCompiler()
    }
  },
  errorHandler: (error) => {
    console.log("deu erro aqui", error)
  },
  queue: 'video-maker'
})

// const database = new Database();
// (async () => {
//   try {
//     await database.connect()
//     new VideoMaker({
//       connection: database.connection,
//       currentShowId: 1
//     })
//   } catch (error) {
//     console.log("FINALMENT", error)
//   }
// })()
