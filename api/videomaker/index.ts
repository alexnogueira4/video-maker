import { DEFAULTS, OPENINGS_TYPES, OPENINGS } from './constants'
import moment from 'moment';
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
      await this.concatMedia()
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

  addOpening({ type, opening = null }) {
    opening = opening || this.showToCompile.openings
    if (opening && type) {
      return { fileName: `/Volumes/HDExterno/openings/${opening[type]}.mp4` }
    }
  }

  async addComercials(time = DEFAULTS.COMERCIAL_DURATION) {
    let duration = 0;
    let comercials = []
    this.comercials = this.shuffle(this.comercials)

    this.comercials.some(comercial => {
      if (duration >= time) return true;
      const comercial_path = `/Volumes/HDExterno/${comercial.path}/${comercial.name}.mp4`;
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
        clip.push(this.addOpening({ type: OPENINGS_TYPES.START_COMERCIAL }))
        let comercials: any = await this.addComercials()
        clip.push(...comercials)
        clip.push(this.addOpening({ type: OPENINGS_TYPES.END_COMERCIAL }))
      }

      duration += this.formatTime(cartoons_episodes.duration)
      let episode_path = `/Volumes/HDExterno/${cartoons.path}/${cartoons_episodes.episode}.mp4`;
      clip.push({ fileName: episode_path })
    }

    const opening = this.showToCompile.openings

    if (Object.keys(opening).length) {
      clip.unshift(this.addOpening({ type: OPENINGS_TYPES.START }))
      let comercials: any = await this.addComercials(DEFAULTS.COMERCIAL_START_DURATION)
      clip.unshift(...comercials)
      clip.push(this.addOpening({ type: OPENINGS_TYPES.END }))
    }

    let comercials = await this.addComercials(DEFAULTS.COMERCIAL_END_DURATION)
    clip.push(...comercials)
    return clip;
  }

  async concatMedia() {
    let clips = await this.formatClips()

    await this.videoConcat({
      // ffmpeg_path: <path-to-ffmpeg> Optional. Otherwise it will just use ffmpeg on your $PATH
      silent: false, // optional. if set to false, gives detailed output on console
      overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
    })
      .clips(clips)
      .output(`${this.showToCompile.path}.mkv`) //optional absolute file name for output file
      .concat()
      .then((outputFileName) => {
        console.log("\n\noutputFileName:", outputFileName)
        this.updateShow()
      }).catch(error => {
        console.log("CATCH", error)
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
    const tomorrowDate = moment(this.showToCompile.date_to_show).add(2, 'days').format("YYYY-MM-DD");

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

    console.log("Next show scheduled: ", data)
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
    const tomorrowDate = moment().add(1, 'days').format("YYYY-MM-DD");

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
    data.openings = OPENINGS[data.path]

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