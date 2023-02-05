'use strict';

let tmp = require('tmp');
let shelljs = require('shelljs');
let _ = require('lodash');

module.exports = function (spec) {

	let that = null;
	let clips = [];
	let outputFileName = tmp.tmpNameSync({
		prefix: 'video-output-',
    postfix: '.mp4'
	});

	spec = _.defaults(spec, {
    silent: false,
    overwrite: null,
    ffmpeg_path:'ffmpeg'
  });

  function handleOverwrite() {
    switch (spec.overwrite) {
      case true:
        return '-y'
      case false:
        return '-n'
      default:
        return ''
    }
  }

	function setClips(_clips) {
		if (Array.isArray(_clips)) {
			clips = _clips;
		} else {
			throw new Error('Expected parameter to be of type `Array`');
		}
		return that;
	}

	function setOutput(fileName) {

		if (fileName) {

			outputFileName = fileName;
		}
    return that;
	}

  /**
   * concatenates clips together using a fileList
   * @param  {string} args.fileList Address of a text file containing filenames of the clips
   * @return {[type]}      [description]
   */
  function concatClips(args) {
    
    const overwrite = handleOverwrite();
    
    return new Promise((resolve, reject) => {
      console.log("LISTA DE VIDEOSSSS", args.fileList, args.fileList.length)
      let child = shelljs.exec(`
        ${spec.ffmpeg_path} ${args.fileList.join('')} -filter_complex "concat=n=${args.fileList.length}:v=1:a=1" -movflags +faststart -preset ultrafast ${outputFileName} ${overwrite}
      `, { async: true, silent: spec.silent });

      child.on('exit', (code, signal) => {

        if (code === 0) {
          resolve(outputFileName);
        } else {
          console.log(
            "entrou aqui",
            "\n", spec.ffmpeg_path,
            "\n", args.fileList,
            "\n", outputFileName,
            "\n", overwrite,
            "\n", code,
            "\n-", signal,
          )
          reject(["entrou aqui", spec.ffmpeg_path, args.fileList, outputFileName, overwrite]);
        }
      });
    });
  }

  function escapePath(pathString) {
    return pathString.replace(/\\/g, '\\\\');
  }

  function getLineForClip(clip) {
    return `-i ${escapePath(clip.fileName)} `;
  }

  function getTextForClips(clips) {
    return clips.map(getLineForClip);
  }

  function doConcat() {

    let fileListText = getTextForClips(clips);
    
    return concatClips({
      fileList: fileListText,
    });
  }

	that = Object.create({
		clips: setClips,
		output: setOutput,
		concat: doConcat,
	});

	return that;
}
