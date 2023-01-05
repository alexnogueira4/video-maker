import http from 'http';
import fs from 'fs';
import url from 'url';

export default class MediaServer {
  server: any;
  filePath: string;
  port: any;
  constructor() {
    this.filePath = process.env.MEDIA_PATH;
    this.port = process.env.MEDIA_PORT
    this.server = http;
  }

  createServer(req, res) {
    // Parse the request url
    const reqUrl = url.parse(req.url).pathname
    if (reqUrl) {
      this.filePath = process.env.MEDIA_PATH + reqUrl.substring(1)
    }
    
    try {
      const stat = fs.statSync(this.filePath);
      const total = stat.size;
      if (req.headers['range']) {
        const range = req.headers.range;
        const parts = range.replace(/bytes=/, "").split("-");
        const partialstart = parts[0];
        const partialend = parts[1];

        const start = parseInt(partialstart, 10);
        const end = partialend ? parseInt(partialend, 10) : total - 1;
        const chunksize = (end - start) + 1;

        const file = fs.createReadStream(this.filePath, { start: start });
        res.writeHead(206, {
          'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
        });
        file.pipe(res);
      } else {
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(this.filePath).pipe(res);
      }
    } catch (error) {
      console.log('error trying to start the server')
    }
  }
  start() {
    this.server
      .createServer(this.createServer.bind(this))
      .listen(this.port)
      .on('error', (err) => {
        console.log("SERVIDOOOOOOOOOOR: ", err)
      });

    console.log(`Server running at ${process.env.SERVER_IP}:${this.port}`)
  }
}