import videoStitch from '../../clients/video-stitch';

export default class VideoMaker {
  videoConcat: any;
  connection: any;
  constructor(options) {
    //   this.connection = options.connection
    try {
      this.videoConcat = videoStitch.concat;
      this.concatMedia()
    } catch (error) {
      console.log("ERRRRRROU", error)
    }
  }

  async concatMedia() {

    await this.videoConcat({
      // ffmpeg_path: <path-to-ffmpeg> Optional. Otherwise it will just use ffmpeg on your $PATH
      silent: true, // optional. if set to false, gives detailed output on console
      overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
    })
      .clips([
        {
          "fileName": "media_test.mp4"
        },
        {
          "fileName": "media_test.mp4"
        }
      ])
      .output("test_new_desenhos2.mp4") //optional absolute file name for output file
      .concat()
      .then((outputFileName) => {
        console.log("\n\noutputFileName:", outputFileName)
      }).catch(error=>{
        console.log("CATCH", error)
      });
  }

  //   async getChannel(channel) {
  //     if (!channel) {
  //       console.log('no channel provided')
  //       return false;
  //     }

  //     const { data, error: channelError } = await this.connection
  //       .from('channels')
  //       .select()
  //       .eq('channelName', channel)
  //       .limit(1)
  //       .single()

  //     if (channelError) {
  //       console.log("channel not found")
  //       return false;
  //     }

  //     return data
  //   }

  //   async getScheduleGrid(channelId) {
  //     if (!channelId) {
  //       console.log('no channelId provided')
  //       return false;
  //     }

  //     console.log('DAY TODAY', getDay())
  //     const { data: scheduleGrid, error } = await this.connection
  //       .from('scheduleGrid')
  //       .select()
  //       .match({
  //         channel: channelId,
  //         days: getDay()
  //       })
  //       .lt('startTime', getDateTime())
  //       .gt('endTime', getDateTime())
  //       .limit(1)
  //       .single()

  //     if (error) {
  //       console.log("getChannelGrid Error: ", error)
  //       return false
  //     } else {
  //       return scheduleGrid;
  //     }
  //   }

  //   startGrid() {
  //     setInterval(() => {
  //       Object.keys(this.device).forEach(async (key, index) => {
  //         const device = this.device[key];
  //         let channel:any = {};
  //         let scheduleGrid:any = {};
  //         let contentName = null;
  //         channel = await this.getChannel(device.friendlyName)

  //         if (channel) {
  //           scheduleGrid =  await this.getScheduleGrid(channel.id)
  //         }

  //         const content = this.getDeviceContent(device.friendlyName) || {}

  //         if (content.contentId) {
  //           contentName = this.getContentFromUrl(content)
  //         }
  //         console.log('\nfile ', scheduleGrid.file)
  //         console.log('contentName ', contentName)
  //         var r = !contentName || scheduleGrid.file !== contentName
  //         var s = scheduleGrid.file
  //         console.log('!contentName || scheduleGrid.file !== contentName: ', r);
  //         console.log('scheduleGrid.file', s)
  //         console.log('SHOULD CHANGE: ', r && !!s)
  //         console.log('\n')

  //         if (
  //           !!scheduleGrid.file &&
  //           (!contentName || scheduleGrid.file !== contentName)
  //         ) {
  //           this.playMedia({
  //             device,
  //             channel,
  //             scheduleGrid
  //           })
  //         } else if (!scheduleGrid.file && Object.keys(content).length) {
  //           this.stopMedia(device)
  //         }

  //       });
  //     }, 10000)
  //   }

  //   getContentFromUrl(content) {
  //     if (content.contentType === 'x-youtube/video') {
  //       return `https://www.youtube.com/watch?v=${content.contentId}`;
  //     } else {
  //       let url = new URL(content.contentId);
  //       return url.pathname ? url.pathname.substring(1) : ''
  //     }
  //   }
}