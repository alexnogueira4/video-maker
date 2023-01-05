const EventEmitter = require('events')
const mdns = require('multicast-dns')
const txt = require('dns-txt')()
const Device = require('./device')

const findCast = require('./find')

class Client extends EventEmitter {
  constructor () {
    super()
    console.log('Initializing...')
    // Internal storage
    this._devices = {}

    // Public
    this.devices = []

    // Query MDNS
    this.responseMDNS()

    this.queryMDNS()
    setInterval(()=>{
      this._findChromecast()
    }, 5000)
    this.timesTried = 0
  }

  _findChromecast() {
    let _this = this;
    findCast(function(err, service) {
      if (err) {
        console.log('Nao encontrou nenhum chromecast, resetando...')
        _this._devices = {};
        _this.devices = [];
        _this._triggerMDNS()
      }
      if (service)
        console.log('MDNS: chromecast "%s" running on: %s', service.name, service.data);
    })
    
  }

  _updateDevice (name) {
    const device = this._devices[name]

    // Add new device
    const newDevice = new Device({
      name: name,
      friendlyName: device.name,
      host: device.host
    })
    newDevice.on('status', status=>{
      this.emit('status', {status, device: newDevice})
    })

    newDevice.on('error', error=>{
      this.emit('error', error)
    })

    // Add for public storage
    this.devices.push(newDevice)
    this.emit('device', newDevice)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getDevices() {

    if (this.timesTried > 23) {
      return "Tentou demais irmao"
    }
    if (
      (!this.devices.length 
      || !this.devices)
      && this.timesTried <= 23
    ) {
      this.timesTried++;
      await this.sleep(1000)
      return this.getDevices()
    } else {
      console.log("retornando getDevices")
      return this.devices;
    }
  }

  queryMDNS() {
    if (this._mdns) {
      this._mdns.on('query', (query) => {
        if (query.questions[0] && query.questions[0].name === '_googlecast._tcp.local') {
          this._mdns.respond(query)
        }
      })
    }
  }

  responseMDNS () {
    console.log('Querying MDNS...')
    // MDNS
    this._mdns = mdns()
    this._mdns.on('response', (response) => {
      const onEachAnswer = (a) => {
        let name
        if (a.type === 'PTR' && a.name === '_googlecast._tcp.local') {
          console.log('DNS [PTR]: ', a.name);
          name = a.data
          if (!this._devices[name]) {
            // New device
            this._devices[name] = { name: null, host: null }
          }
        }

        name = a.name
        if (a.type === 'SRV' && this._devices[name] && !this._devices[name].host) {
          console.log('DNS [SRV]: ', a.name);
          // Update device
          this._devices[name].host = a.data.target
          if (this._devices[name].name) {
            this._updateDevice(name)
          }
        }

        if (a.type === 'TXT' && this._devices[name] && !this._devices[name].name) {
          console.log('DNS [TXT]: ', a.name);

          // Fix for array od data
          let decodedData = {}
          if (Array.isArray(a.data)) {
            a.data.forEach((item) => {
              const decodedItem = txt.decode(item)
              Object.keys(decodedItem).forEach((key) => {
                decodedData[key] = decodedItem[key]
              })
            })
          } else {
            decodedData = txt.decode(a.data)
          }

          const friendlyName = decodedData.fn || decodedData.n
          if (friendlyName) {
            // Update device
            this._devices[name].name = friendlyName
            if (this._devices[name].host) {
              this._updateDevice(name)
            }
          }
        }
      }

      response.answers.forEach(onEachAnswer)
      response.additionals.forEach(onEachAnswer)
    })

    // Query MDNS
    this._triggerMDNS()
  }
  
  _triggerMDNS () {
    if (this._mdns) this._mdns.query('_googlecast._tcp.local', 'PTR')
  }

}

module.exports = Client
