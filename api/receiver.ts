import amqp from 'amqplib';

export default class Receiver {
  callback: Function;
  errorHandler: Function;
  queue: string;
  constructor(options) {
    this.callback = options.callback
    this.errorHandler = options.errorHandler
    this.queue = options.queue || 'video-maker'
    this.receive()
  }
  async receive() {
    const connection = await amqp.connect('amqp://localhost:5672')
    const channel = await connection.createChannel()
    await channel.assertQueue(this.queue, { durable: false });
    await channel.prefetch(1)
    console.log("[x] Waiting messages %s\n");
    channel.consume(this.queue, async (msg) => {
      var message = JSON.parse(msg.content.toString());

      try {
        await this.callback(message)
        await channel.ack(msg)
      } catch (error) {
        await channel.ack(msg)
        this.errorHandler(error)
        setTimeout(()=>{
          channel.sendToQueue(this.queue, msg.content);
        }, 600000)
      }
    });
  }
}
