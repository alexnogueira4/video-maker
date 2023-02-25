export const OPENINGS = {
  tv_globinho_: {
    start: 'opening_tv_globinho',
    start_comercial: 'opening_apresentando_tv_globinho',
    end_comercial: 'opening_volta_tv_globinho',
    end: 'ending_tv_globinho'
  }
}

export const OPENINGS_TYPES = {
  START: 'start',
  START_COMERCIAL: 'start_comercial',
  END_COMERCIAL: 'end_comercial',
  END: 'end'
}

export const DEFAULTS = {
  COMERCIAL_START_DURATION: 600, // 10 minutes
  COMERCIAL_END_DURATION: 900, // 15 minutes
  COMERCIAL_DURATION: 420, // 6 minutes
  CARTOON_DURATION: 840, // 19 minutes
}

export const DAYS_OF_WEEK = {
  weekdays: [1,2,3,4,5],
  saturday: [6],
  sunday: [0]
};

export const DAYS_FROM_DB = {
  1: 'weekdays',
  2: 'saturday',
  3: 'sunday'
}

export default {}