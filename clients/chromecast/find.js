const mdns = require('multicast-dns');

const defaults = {
  ttl: 5000,
  service_name: '_googlecast._tcp.local',
  service_type: 'PTR',
  mdns: {}
};

module.exports = function(opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = defaults;
  } else {
    opts = {
        ...defaults,
        ...opts
    }
  }

  const m = mdns(opts.mdns);
  let casts;
  const timer = setTimeout(function() {
    close();
  }, opts.ttl);

  let onResponse = function(response) {
    let answer = response.answers[0];

    if (answer &&
        (answer.name !== opts.service_name ||
         answer.type !== opts.service_type)) {
      return;
    }

    let info = response.additionals.find(entry => entry.type === 'A');

    if (!info || (opts.name && info.name !== opts.name)) {
      return;
    }
    casts = info;
    cb(null, info, response);
    return;
  };

  m.on('response', onResponse);

  m.query({
    questions:[{
      name: opts.service_name,
      type: opts.service_type
    }]
  });

  let close = function() {
    if (!casts) {
        cb({})
    }
    m.removeListener('response', onResponse);
    clearTimeout(timer);
    m.destroy();
  };

  return close;
};