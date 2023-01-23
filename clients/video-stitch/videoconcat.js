'use strict';

let tmp = require('tmp');
let fext = require('file-extension');
let fs = require('fs');
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
      console.log("ENTROU AQUI")
      let child = shelljs.exec(`${spec.ffmpeg_path} -f concat -safe 0 -protocol_whitelist file,http,https,tcp,tls,crypto -i ${args.fileList} -c copy ${outputFileName} ${overwrite}`, { async: true, silent: spec.silent });

      child.on('exit', (code, signal) => {

        if (code === 0) {
          resolve(outputFileName);
        } else {
          console.log(
            "entrou aqui",
            "\n", spec.ffmpeg_path,
            "\n", args.fileList,
            "\n", outputFileName,
            "\n", overwrite
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
    return `file '${escapePath(clip.fileName)}'`;
  }

  function getTextForClips(clips) {
    return clips.map(getLineForClip).join('\n');
  }

  function doConcat() {

    let fileListText = getTextForClips(clips);
    
    // let fileListFilename = tmp.tmpNameSync({
      //   postfix: '.txt'
      // });
      // // fs.writeFileSync(fileListFilename, fileListText, 'utf8');
      let name = "videotext.txt";
      fs.writeFileSync(name, fileListText, 'utf8');

      // console.log("TEXTOOOO", fileListFilename, name)

    return concatClips({
      fileList: name,
    });
  }

	that = Object.create({
		clips: setClips,
		output: setOutput,
		concat: doConcat,
	});

	return that;
}
