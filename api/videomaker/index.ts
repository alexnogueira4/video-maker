import { DEFAULTS, OPENINGS_TYPES } from './constants'
import moment from 'moment';
import shelljs from 'shelljs';
import videoStitch from '../../clients/video-stitch';

var records = [
  // { name: 'A Turma do Pateta', episodes: 8, duration: '00:22:00', path: 'a_turma_do_pateta' },
]

export default class VideoMaker {
  videoConcat: any;
  connection: any;
  showToCompile: any;
  showGrid: any;
  clips: any = [];
  comercials: any;
  currentShowId: any;
  openings: any;
  constructor(options) {
    this.connection = options.connection

    if (!options.currentShowId) {
      console.log("A show ID must be provided")
      throw 'A show ID must be provided';
    }

    this.currentShowId = options.currentShowId
    try {
      this.videoConcat = videoStitch.concat;
      this.startCompiler()
    } catch (error) {
      console.log("ERRRRRROU", error)
    }
  }

  async startCompiler() {
    try {
      // this.loadCartoons()
      await this.getShowToCompile()
      // await this.getShowGrid()
      await this.getComercials()
      await this.getOpenings()
      await this.sliceClips()
    } catch (error) {
      console.log(error)
    }
  }

  shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  formatTime(time) {
    const timeSplit = time.split(':')
    let hoursToSeconds = parseInt(timeSplit[0]) * 60 * 60
    return parseInt(timeSplit[1]) * 60 + hoursToSeconds + parseInt(timeSplit[2])
  }

  addOpening(type) {
    let opening = this.openings.find(e => e.type === type)

    if (opening && type) {
      return { fileName: `${process.env.MEDIA_FOLDER}/openings/${opening.name}.mp4` }
    }
  }

  async addComercials(time = DEFAULTS.COMERCIAL_DURATION) {
    // return []
    let duration = 0;
    let comercials = []
    this.comercials = this.shuffle(this.comercials)

    this.comercials.some(comercial => {
      if (duration >= time) return true;
      const comercial_path = `${process.env.MEDIA_FOLDER}/${comercial.path}/${comercial.name}.mp4`;
      comercials.push({ fileName: comercial_path })
      duration += this.formatTime(comercial.duration)
    })

    return comercials
  }

  async formatClips() {
    let duration = 0;
    let clip = []

    for (const { cartoons, cartoons_episodes } of this.showToCompile.showsGrid) {
      if (duration >= DEFAULTS.CARTOON_DURATION) {
        duration = 0
        clip.push(this.addOpening(OPENINGS_TYPES.START_COMERCIAL))
        let comercials: any = await this.addComercials()
        clip.push(...comercials)
        clip.push(this.addOpening(OPENINGS_TYPES.END_COMERCIAL))
      }

      duration += this.formatTime(cartoons_episodes.duration)
      let episode_path = `${process.env.MEDIA_FOLDER}/${cartoons.path}/${cartoons_episodes.episode}.mp4`;
      clip.push({ fileName: episode_path })
    }

    if (Object.keys(this.openings).length) {
      clip.unshift(this.addOpening(OPENINGS_TYPES.START))
      let comercials: any = await this.addComercials(DEFAULTS.COMERCIAL_START_DURATION)
      clip.unshift(...comercials)
      clip.push(this.addOpening(OPENINGS_TYPES.END))
    }

    let comercials = await this.addComercials(DEFAULTS.COMERCIAL_END_DURATION)
    clip.push(...comercials)
    return clip;
  }

  async sliceClips(clips = null) {
    clips = clips || await this.formatClips()
    let arrayOfFilesSize = 5
    var clipsSliced: any = new Array(Math.ceil(clips.length / arrayOfFilesSize))
      .fill('')
      .map(_ => clips.splice(0, arrayOfFilesSize))

    let totalClips = [];
    for (const clipsList of clipsSliced) {
      console.log(clipsList)
      await this.concatMedia(clipsList, (outputFileName) => {
        totalClips.push({ fileName: outputFileName })
      })
    }

    if (totalClips.length > arrayOfFilesSize) {
      this.sliceClips(totalClips)
    } else {

      await this.concatMedia(totalClips, (outputFileName) => {
        console.log("final name", outputFileName)
        this.updateShow()
        this.deleteTempFiles()
      }, this.showToCompile.path)
    }

  }

  async concatMedia(clips, callback, fileName = null) {
    fileName = fileName || `_temp_${new Date().valueOf()}`
    // callback(fileName)
    await this.videoConcat({
      silent: false, // optional. if set to false, gives detailed output on console
      overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
    })
      .clips(clips)
      .output(`${process.env.MEDIA_FOLDER}/medias/${fileName}.mkv`) //optional absolute file name for output file
      .concat()
      .then((outputFileName) => {
        console.log("\n\noutputFileName:", outputFileName)
        callback(outputFileName)
      }).catch(error => {
        console.log("CATCH", error)
        throw error
      });
  }


  async getShowGrid() {
    if (!this.showToCompile.id) {
      console.log('no show found')
      throw 'no show found'
    }

    const { data, error } = await this.connection
      .from('showsGrid')
      .select(`
        id,
        scheduleShow,
        order,
        cartoons_episodes (
          episode,
          duration,
          part
        ),
        cartoons (
          path,
          episodes
        )
      `)
      .eq('scheduleShow', this.showToCompile.id)
      .order('order')

    if (error) {
      console.log("show grid not found", error)
      return false;
    }
    this.showGrid = data

    return data
  }

  async updateShow() {
    const tomorrowDate = moment(this.showToCompile.date_to_show).add(1, 'days').format("YYYY-MM-DD");

    const { data: nextShow, error: errorNextShow } = await this.connection
      .from('scheduleShow')
      .insert({
        show: this.showToCompile.show,
        date_to_show: tomorrowDate,
        compiled: false
      })
      .select()
      .single()

    if (errorNextShow) {
      throw errorNextShow
    }

    let nextEpisodes = await Promise.all(this.showToCompile.showsGrid.map(async show => {
      let nextEpisode = show.cartoons.episodes === show.cartoons_episodes.episode ? 1 : show.cartoons_episodes.episode + 1
      const { data: nextEpisodeDb, error: error3 } = await this.connection
        .from('cartoons_episodes')
        .select('*')
        .eq('episode', nextEpisode)
        .eq('cartoon', show.cartoons.id)
        .single()

      return {
        cartoon_episode: nextEpisodeDb.id,
        scheduleShow: nextShow.id,
        cartoon: show.cartoons.id,
        shows: this.showToCompile.show,
        order: show.order
      }
    }))

    const { error: updateEpisodesError } = await this.connection
      .from('showsGrid')
      .upsert(nextEpisodes)
      .select()

    if (updateEpisodesError) {
      throw updateEpisodesError
    }

    const { data, error: errorNextShowSchedule } = await this.connection
      .from('scheduleShow')
      .update({
        compiled: true
      })
      .eq('id', this.showToCompile.id)
      .select()

    if (errorNextShowSchedule) {
      throw errorNextShowSchedule
    }

    console.log("Next show scheduled: ", nextShow)
  }

  compare(a, b) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  }

  async getShowToCompile() {
    // const tomorrowDate = moment().add(1, 'days').format("YYYY-MM-DD");
    const tomorrowDate = moment().format("YYYY-MM-DD");

    const { data, error } = await this.connection
      .from('scheduleShow')
      .select(`
        *,
        shows(path),
        showsGrid(
          id,
          scheduleShow,
          order,
          cartoons_episodes (
            episode,
            duration,
            part
          ),
          cartoons (
            id,
            path,
            episodes
          )
        ) order order
      `)

      .eq('date_to_show', tomorrowDate)
      .eq('compiled', false)
      .eq('show', this.currentShowId)
      .limit(1)
      .single()

    if (error) {
      console.log("show not found")
      throw error;
    }

    data.path = data.shows.path
    data.showsGrid.sort(this.compare)
    // data.openings = OPENINGS[data.path]

    this.showToCompile = data

    return data
  }

  async getComercials() {
    const { data, error } = await this.connection
      .from('comercials')
      .select()

    if (error) {
      console.log("show not found", error)
      return false;
    }

    this.comercials = data

    return data
  }

  async getOpenings() {
    const { data, error } = await this.connection
      .from('openings')
      .select()
      .eq('show', this.showToCompile.show)

    if (error) {
      console.log("opening not found", error)
      return false;
    }

    this.openings = data

    return data
  }

  async loadCartoons() {
    for (let x = 0; x < Object.keys(records).length; x++) {
      let record = records[x]
      let name = record.name
      let episodes = record.episodes
      let path = record.path
      let duration = record.duration
      const { data: cartoons, error } = await this.connection
        .from('cartoons')
        .insert({ name, episodes, path })
        .select()
      console.log("DESENHO", cartoons)

      for (let i = 1; i <= episodes; i++) {
        const { data, error } = await this.connection
          .from('cartoons_episodes')
          .insert({ name: i + ' ' + name, episode: i, duration, cartoon: cartoons[0].id })
          .select()
        console.log('error: ', error)
        console.log('number: ', i)
        console.log('data: ', data[0].episode, data[0].name)
      }
    }
  }

  async deleteTempFiles() {
    return new Promise((resolve, reject) => {
      let child = shelljs.exec(`rm ${process.env.MEDIA_FOLDER}/medias/_temp_*`, { async: true, silent: true });

      child.on('exit', (code, _signal) => {
        if (code === 0) {
          resolve(true);
        } else {
          console.log("error deleting temp files")
          reject("error deleting temp files");
        }
      });
    });

  }

  // async loadComercials() {
  //   for (let x = 0; x < Object.keys(comercials).length; x++) {
  //     let record = comercials[x]
  //     let name = record.name
  //     let path = record.path
  //     let duration = record.duration
  //     const { data, error } = await this.connection
  //       .from('comercials')
  //       .insert({ name, duration, path })
  //       .select()
  //     console.log('error: ', error)
  //     console.log('data: ', data[0].id, data[0].episode, data[0].name)
  //   }
  // }
}