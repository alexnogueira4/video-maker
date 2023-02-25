import shelljs from 'shelljs';
import _ from 'lodash';

export default class VideoConcat {
  spec;
	_clips:any = [];
  outputFileName: String;
  constructor(options) {
    this.spec = _.defaults(options, {
      silent: false,
      overwrite: null,
      quiet: false,
      stats: true,
      ffmpeg_path:'ffmpeg'
    });
  }

  handleOverwrite() {
    return this.spec.overwrite ? '-y' : '-n'
  }

  isQuiet() {
    return this.spec.quiet ? '-v quiet' : ''
  }

  isStats() {
    return this.spec.stats ? '-stats' : ''
  }

	clips(_clips) {
		if (Array.isArray(_clips)) {
			this._clips = _clips;
		} else {
			throw new Error('Expected parameter to be of type `Array`');
		}
		return this;
	}

  output(fileName) {
		if (fileName) {
			this.outputFileName = fileName;
		}
    return this;
	}

  concat() {
    const fileList = this._clips.map(this.getLineForClip);
    const overwrite = this.handleOverwrite();

    return new Promise((resolve, reject) => {
      const child = shelljs.exec(`
        ${this.spec.ffmpeg_path} ${this.isQuiet()} ${this.isStats()} ${fileList.join('')} -filter_complex "concat=n=${fileList.length}:v=1:a=1" -movflags +faststart -preset ultrafast ${this.outputFileName} ${overwrite}
      `, { async: true, silent: this.spec.silent });

      child.on('exit', (code, signal) => {

        if (code === 0) {
          resolve(this.outputFileName);
        } else {
          reject({ signal, code, child, fileList });
        }
      });
    });
  }

  getLineForClip(clip) {
    return `-i ${clip.fileName.replace(/\\/g, '\\\\')} `;
  }
}
