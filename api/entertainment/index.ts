import Client from '../../clients/chromecast/client'
import MediaServer from './mediaServer'
import { getDateTime,
  diffTime,
  timeToSeconds,
  isUrl,
  getDay
} from '../utils'
export default class Entertainment {
  client: any;
  device: any = {};
  connection: any;
  mediaServer: any;
  constructor(options) {
    this.connection = options.connection
    this.client = new Client()
    this.onDevice()
    this.mediaServer = new MediaServer()
    this.mediaServer.start();
  }

  onDevice() {
    this.client.on('device', (device) => {
      this.device[device.friendlyName] = device
      this.startGrid()
    })
    this.client.on('status', ({status, device}) => {
      this.device[device.friendlyName].status = status
      if (status.media && Object.keys(status.media).length) {
        this.device[device.friendlyName].media = status.media
      }
    })
  }

  getDeviceContent(deviceName){
    if (!deviceName || !Object.keys(this.device[deviceName]).length) {
      console.log('no device found or provided')
      return null;
    }
    let deviceMedia = this.device[deviceName].media

    if (!deviceMedia) {
      console.log('no media found on device: ', deviceName)
      return null;
    }

    return deviceMedia
  }

  stopMedia(device) {
    device.stop()
  }

  async playMedia({ scheduleGrid = {}, channel = {}, device = null }:any = {}) {
    let media;
    if (!scheduleGrid) {
      console.log('no scheduleGrid provided')
    }
    if (!channel) {
      console.log('no scheduleGrid provided')
    }

    if (scheduleGrid.file) {
      media = scheduleGrid.file;
      
      if (!isUrl(media)) {
        media = `${process.env.SERVER_IP}:${process.env.MEDIA_PORT}/${media}`
        // media = `http://192.168.100.24:${process.env.MEDIA_PORT}/${media}`
      }
    }

    const timeDiff = diffTime(scheduleGrid.startTime, getDateTime())

    if (media) {
      device.play(media, { startTime: timeToSeconds(timeDiff) }, function (err) {
        if (err) {
          console.log("err", err)
        }
        console.log('Playing in your chromecast')
      })
    }
    return true
  }

  async getChannel(channel) {
    if (!channel) {
      console.log('no channel provided')
      return false;
    }

    const { data, error: channelError } = await this.connection
      .from('channels')
      .select()
      .eq('channelName', channel)
      .limit(1)
      .single()

    if (channelError) {
      console.log("channel not found")
      return false;
    }

    return data
  }

  async getScheduleGrid(channelId) {
    if (!channelId) {
      console.log('no channelId provided')
      return false;
    }

    console.log('DAY TODAY', getDay())
    const { data: scheduleGrid, error } = await this.connection
      .from('scheduleGrid')
      .select()
      .match({
        channel: channelId,
        days: getDay()
      })
      .lt('startTime', getDateTime())
      .gt('endTime', getDateTime())
      .limit(1)
      .single()

    if (error) {
      console.log("getChannelGrid Error: ", error)
      return false
    } else {
      return scheduleGrid;
    }
  }

  startGrid() {
    setInterval(() => {
      Object.keys(this.device).forEach(async (key, index) => {
        const device = this.device[key];
        let channel:any = {};
        let scheduleGrid:any = {};
        let contentName = null;
        channel = await this.getChannel(device.friendlyName)

        if (channel) {
          scheduleGrid =  await this.getScheduleGrid(channel.id)
        }

        const content = this.getDeviceContent(device.friendlyName) || {}

        if (content.contentId) {
          contentName = this.getContentFromUrl(content)
        }
        console.log('\nfile ', scheduleGrid.file)
        console.log('contentName ', contentName)
        var r = !contentName || scheduleGrid.file !== contentName
        var s = scheduleGrid.file
        console.log('!contentName || scheduleGrid.file !== contentName: ', r);
        console.log('scheduleGrid.file', s)
        console.log('SHOULD CHANGE: ', r && !!s)
        console.log('\n')

        if (
          !!scheduleGrid.file &&
          (!contentName || scheduleGrid.file !== contentName)
        ) {
          this.playMedia({
            device,
            channel,
            scheduleGrid
          })
        } else if (!scheduleGrid.file && Object.keys(content).length) {
          this.stopMedia(device)
        }

      });
    }, 10000)
  }

  getContentFromUrl(content) {
    if (content.contentType === 'x-youtube/video') {
      return `https://www.youtube.com/watch?v=${content.contentId}`;
    } else {
      let url = new URL(content.contentId);
      return url.pathname ? url.pathname.substring(1) : ''
    }
  }
}