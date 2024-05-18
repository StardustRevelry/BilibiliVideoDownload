import ffmpeg from 'fluent-ffmpeg'
const ffmpegPath = require('ffmpeg-static')
const log = require('electron-log')
const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  ffmpeg.setFfmpegPath(ffmpegPath)
} else {
  // see: https://github.com/electron/electron-packager/issues/740
  ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'))
}

export const mergeVideoAudio = (videoPath?: string, audioPath?: string, out?: string) => {
  if (!out) {
    throw new Error('Output should not be empty')
  }
  if (!videoPath && !audioPath) {
    throw new Error('Neither videoPath nor audioPath exist')
  }
  // console.log(videoPath, audioPath, out)
  return new Promise((resolve, reject) => {
    const ffmpegOp = ffmpeg()
    if (videoPath) {
      log.info(`input video: ${videoPath}`)
      ffmpegOp
        .input(videoPath)
        .videoCodec('copy')
    }

    if (audioPath) {
      log.info(`input audio ${audioPath}`)
      ffmpegOp.input(audioPath)
      if (videoPath) {
        ffmpegOp.audioCodec('copy')
      }
    }
    ffmpegOp
      .on('start', (cmd: any) => {
        log.info(`开始转码：${cmd}`)
      })
      .on('end', () => {
        resolve('end')
      })
      .on('error', (err: any) => {
        log.error(`合成失败：${err.message}`)
        reject(err)
      })
      .save(out)
  })
}
