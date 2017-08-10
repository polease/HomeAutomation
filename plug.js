const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plug = client.getPlug({host: '192.168.31.105'});
// plug.getInfo().then(console.log);


plug.setPowerState(true).then(console.log);

// // Look for plugs, log to console, and turn them on
// client.startDiscovery().on('plug-new', (plug) => {
//   plug.getInfo().then(console.log);
//   plug.setPowerState(true);
// });
