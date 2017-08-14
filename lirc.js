// Sending commands
lirc_node = require('lirc_node');
lirc_node.init();

// To see all of the remotes and commands that LIRC knows about:
console.log(lirc_node.remotes);

/*
  Let's pretend that the output of lirc_node.remotes looks like this:

  {
    "tv": ["Power", "VolumeUp", "VolumeDown"],
    "xbox360": ["Power", "A", "B"]
  }
*/

// Tell the TV to turn on
lirc_node.irsend.send_once("fanremote", "KEY_POWER", function() {
  console.log("Sent Fan power command!");
});

// // Tell the Xbox360 to turn on
// lirc_node.irsend.send_once("xbox360", "power", function() {
//   console.log("Sent Xbox360 power command!");
// });


// Listening for commands
var listenerId = lirc_node.addListener(function(data) {
  console.log("Received IR keypress '" + data.key + "'' from remote '" + data.remote +"'");
});

lirc_node.addListener('KEY_1', 'remote1', function(data) {
  console.log("Received IR keypress 'KEY_1' from remote 'remote1'");
  // data also has `code` and `repeat` properties from the output of `irw`
  // The final argument after this callback is a throttle allowing you to
  // specify to only execute this callback once every x milliseconds.
}, 400);
