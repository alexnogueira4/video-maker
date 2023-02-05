import { DEFAULTS, OPENINGS_TYPES, OPENINGS } from './constants'
import moment from 'moment';
import videoStitch from '../../clients/video-stitch';
import { start } from 'repl';

// var records = [
//   { name: 'A Turma do Pateta', episodes: 8, duration: '00:22:00', path: 'a_turma_do_pateta' },
//   { name: 'A Vida e As Aventuras de Juniper Lee', episodes: 23, duration: '00:23:00', path: 'a_vida_e_as_aventuras_de_juniper_lee' },
//   { name: 'As Aventuras de Babar', episodes: 39, duration: '00:23:20', path: 'as_aventuras_de_babar' },
//   { name: 'As Aventuras de Jackie Chan', episodes: 95, duration: '00:20:00', path: 'as_aventuras_de_jackie_chan' },
//   { name: 'As Meninas Super Poderosas', episodes: 79, duration: '00:23:00', path: 'as_meninas_superpoderosas' },
//   { name: 'Beyblade', episodes: 51, duration: '00:21:00', path: 'beyblade' },
//   { name: 'Bob Zoom', episodes: 22, duration: '00:01:30', path: 'bob_zoom' },
//   { name: 'Bucky', episodes: 26, duration: '00:22:00', path: 'bucky' },
//   { name: 'Beyblade', episodes: 51, duration: '00:23:00', path: 'beyblade' },
//   { name: 'Capitão Caverna e as Panterinhas', episodes: 20, duration: '00:22:00', path: 'capitao_caverna_e_as_panterinhas' },
//   { name: 'Capitão Planeta - Primeira Temporada', episodes: 25, duration: '00:22:00', path: 'capitao_planeta_primeira_temporada' },
//   { name: 'Caverna do Dragão', episodes: 26, duration: '00:18:00', path: 'caverna_do_dragao' },
//   { name: 'Chapolin Colorado', episodes: 208, duration: '00:23:00', path: 'chapolin_colorado' },
//   { name: 'Chaves', episodes: 221, duration: '00:23:00', path: 'chaves' },
//   { name: 'Doug', episodes: 52, duration: '00:23:00', path: 'doug' },
//   { name: 'Duck Dodgers - Primeira Temporada', episodes: 13, duration: '00:23:00', path: 'duck_dodgers_primeira_temporada' },
//   { name: 'Famiia Dinossauro', episodes: 65, duration: '00:19:00', path: 'familia_dinossauro' },
//   { name: 'Galinha Pintadinha', episodes: 4, duration: '00:30:00', path: 'galinha_pintadinha' },
//   { name: 'He-Man', episodes: 130, duration: '00:20:00', path: 'he_man' },
//   { name: 'Hey Arnold!', episodes: 20, duration: '00:23:00', path: 'hey_arnold' },
//   { name: 'Jetsons - Primeira Temporada', episodes: 24, duration: '00:25:00', path: 'jetsons' },
//   { name: 'Johnny Bravo', episodes: 80, duration: '00:08:00', path: 'johnny_bravo' },
//   { name: 'KND - A Turma do Bairro', episodes: 79, duration: '00:23:00', path: 'knd_a_turma_do_bairro' },
//   { name: 'Laboratório dee Dexter', episodes: 67, duration: '00:07:00', path: 'laboratorio_de_dexter' },
//   { name: 'Liga da Justiça - Primeira Temporada', episodes: 26, duration: '00:22:00', path: 'liga_da_justica_primeira_temporada' },
//   { name: 'Liga da Justiça - Segunda Temporada', episodes: 26, duration: '00:22:00', path: 'liga_da_justica_segunda_temporada' },
//   { name: 'Liga da Justiça Sem Limites - Terceira Temporada', episodes: 13, duration: '00:23:00', path: 'liga_da_justica_terceira_temporada' },
//   { name: 'Liga da Justiça Sem Limites - Quarta Temporada', episodes: 13, duration: '00:22:00', path: 'liga_da_justica_quarta_temporada' },
//   { name: 'Liga da Justiça Sem Limites - Quinta Temporada', episodes: 13, duration: '00:23:00', path: 'liga_da_justica_quinta_temporada' },
//   { name: 'Lilo & Stitch', episodes: 50, duration: '00:22:00', path: 'lilo_e_stitch' },
//   { name: 'Looney Tunes', episodes: 101, duration: '00:07:00', path: 'looney_tunes' },
//   { name: 'Clube da Luluzinha', episodes: 16, duration: '00:08:00', path: 'luluzinha' },
//   { name: 'Mickey Mouse', episodes: 19, duration: '00:07:00', path: 'mickey_mouse' },
//   { name: 'Miraculous - As Aventuras de Ladybug e Chat Noir', episodes: 26, duration: '00:22:00', path: 'miraculous_as_aventuras_de_ladybug_e_chat_noir' },
//   { name: 'O Show do Zé Colméia', episodes: 44, duration: '00:07:00', path: 'o_show_do_ze_colmeia' },
//   { name: 'Os Cavaleiros do Zodíaco - Saga Torneio Galactico', episodes: 8, duration: '00:25:00', path: 'os_cavaleiros_do_zodiaco_saga_torneio_galactico_primeira_saga' },
//   { name: 'Os Cavaleiros do Zodíaco - Saga Cavaleiros de Prata Parte 1', episodes: 15, duration: '00:25:00', path: 'os_cavaleiros_do_zodiaco_saga_cavaleiros_de_prata_parte_1_segunda_saga' },
//   { name: 'Os Cavaleiros do Zodíaco - Saga Cavaleiros de Prata Parte 2', episodes: 16, duration: '00:25:00', path: 'os_cavaleiros_do_zodiaco_saga_cavaleiros_de_prata_parte_2_terceira_saga' },
//   { name: 'Os Cavaleiros do Zodíaco - Saga Doze Casas Parte 1', episodes: 17, duration: '00:25:00', path: 'os_cavaleiros_do_zodiaco_saga_doze_casas_parte_1_quarta_saga' },
//   { name: 'Os Cavaleiros do Zodíaco - Saga Doze Casas Parte 2', episodes: 17, duration: '00:25:00', path: 'os_cavaleiros_do_zodiaco_saga_doze_casas_parte_2_quinta_saga' },
//   { name: 'Os Flintstones', episodes: 166, duration: '00:25:00', path: 'os_flintstones' },
//   { name: 'Os Jovens Titãs - Primeira Temporada', episodes: 13, duration: '00:22:00', path: 'os_jovens_titas_primeira_temporada' },
//   { name: 'Patrulha Canina', episodes: 33, duration: '00:12:00', path: 'patrulha_canina' },
//   { name: 'Pingu', episodes: 24, duration: '00:06:00', path: 'pingu' },
//   { name: 'Rocket Power', episodes: 28, duration: '00:12:00', path: 'rocket_power' },
//   { name: 'Sailor Moon', episodes: 44, duration: '00:24:00', path: 'sailor_moon' },
//   { name: 'Sakura Card Captors', episodes: 70, duration: '00:25:00', path: 'sakura_card_captor' },
//   { name: 'Shurato', episodes: 38, duration: '00:21:00', path: 'shurato' },
//   { name: 'Sonic', episodes: 26, duration: '00:23:00', path: 'sonic_primeira_temporada' },
//   { name: 'Sonic Underground', episodes: 40, duration: '00:22:00', path: 'sonic_segunda_temporada' },
//   { name: 'Super Choque', episodes: 52, duration: '00:22:00', path: 'super_choque' },
//   { name: 'Thundercats', episodes: 87, duration: '00:22:00', path: 'thundercats' },
//   { name: 'Tico e Teco: Defensores da lei', episodes: 13, duration: '00:18:00', path: 'tico_e_teco_defensores_da_lei' },
//   { name: 'Timão e Pumba', episodes: 19, duration: '00:12:00', path: 'timao_e_pumba' },
//   { name: 'Transformers', episodes: 16, duration: '00:22:00', path: 'transformers' },
//   { name: 'Três Espiãs Demais - Primeira Temporada', episodes: 26, duration: '00:22:00', path: 'tres_espias_demais_primeira_temporada' },
//   { name: 'Três Espiãs Demais - Segunda Temporada', episodes: 26, duration: '00:20:00', path: 'tres_espias_demais_segunda_temporada' },
//   { name: 'Três Espiãs Demais - Terceira Temporada', episodes: 26, duration: '00:20:00', path: 'tres_espias_demais_terceira_temporada' },
//   { name: 'Três Espiãs Demais - Quarta Temporada', episodes: 26, duration: '00:20:00', path: 'tres_espias_demais_quarta_temporada' },
//   { name: 'Três Espiãs Demais - Quinta Temporada', episodes: 26, duration: '00:20:00', path: 'tres_espias_demais_quinta_temporada' },
//   { name: 'Tutubarão - Primeira Temporada', episodes: 16, duration: '00:20:00', path: 'tutubarao_primeira_temporada' },
//   { name: 'Ursinhos Carinhosos', episodes: 52, duration: '00:12:00', path: 'ursinhos_carinhosos' },
//   { name: 'X-Men', episodes: 76, duration: '00:22:00', path: 'x_men' }
// ]

/*
ffmpeg 
-f concat -safe 0 
-protocol_whitelist file,http,https,tcp,tls,crypto 
-i videotext.txt 
-vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:color=black, fps=25" 
dani.mp4 -y


ffmpeg -i input1.mp3 -i input2.mp3 -i input3.mp3 -filter_complex "concat=n=3:v=0:a=1" -vn -y input.m4a


ffmpeg -i 1.mp4 -i 6.mp4 -i 16.mp4 -filter_complex "concat=n=3:v=1:a=1" -movflags +faststart -y testao.mp4

ffmpeg -f concat -safe 0 -protocol_whitelist file,http,https,tcp,tls,crypto -i videotext.txt -filter_complex "concat=n=3:v=1:a=1" -preset ultrafast dani2.mkv -y

ffmpeg -f concat -safe 0 -i videotext.txt -filter_complex "concat=n=3:v=1:a=1" -movflags +faststart -y testao.mkv
*/


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

    this.showToCompile.showsGrid.forEach(async ({ cartoons, cartoons_episodes }) => {
      if (duration >= DEFAULTS.CARTOON_DURATION) {
        duration = 0
        clip.push(this.addOpening({ type: OPENINGS_TYPES.START_COMERCIAL }))
        let comercials: any = await this.addComercials()
        clip.push(...comercials)
        clip.push(this.addOpening({ type: OPENINGS_TYPES.END_COMERCIAL }))
      }

      let episode_path = `/Volumes/HDExterno/${cartoons.path}/${cartoons_episodes.episode}.mp4`;
      clip.push({ fileName: episode_path })
      duration += this.formatTime(cartoons_episodes.duration)
    })

    const opening = this.showToCompile.openings
    console.log(opening)

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
    console.log("CLIPS: ", clips[0])
    console.log(this.showToCompile)
    await this.videoConcat({
      // ffmpeg_path: <path-to-ffmpeg> Optional. Otherwise it will just use ffmpeg on your $PATH
      silent: true, // optional. if set to false, gives detailed output on console
      overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
    })
      .clips([clips[0]])
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

    const { data, error: error4 } = await this.connection
      .from('scheduleShow')
      .update({
        compiled: true
      })
      .eq('id', this.showToCompile.id)
      .select()

    console.log("tete", data, error4)

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

      // .eq('date_to_show', tomorrowDate)
      .eq('compiled', false)
      .eq('show', this.currentShowId)
      .limit(1)
      .single()

      console.log(this.currentShowId)
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