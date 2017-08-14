
// Tempeorature Configuration
//var FAN_TEMPERATURE = 83;  //78.5
//var HEATER_TEMPERATURE = 83; //76

var FAN_TEMPERATURE = 78.5;
var HEATER_TEMPERATURE = 76;

// Init Helper package
var fs = require('fs');

// Init Smart Power Plug
const Hs100Api = require('hs100-api');
const client = new Hs100Api.Client();
const fanPlug = client.getPlug({host: '192.168.31.105'});
const heaterPlug = client.getPlug({host: '192.168.31.19'});
// Init plug to off by default
fanPlug.setPowerState(false).then(console.log);
fanPlug.setPowerState(false).then(console.log);
var fanPlugPowerOn = false;
var heaterPlugPowerOn = false;

// Init IR remote control
lirc_node = require('lirc_node');
lirc_node.init();

// Init Tempeorature Sensor
var ds18b20 = require('ds18b20');
ds18b20.sensors(function(err, ids) {console.log(ids);});



var readTemperature = function(){
	ds18b20.temperature('28-0516a10f60ff',function(err, value) {

		var temp = value*9/5+32;
		console.log((new Date()).toString(), ', Current temperature is', temp );

		// temperature control here
		isRoomTooHotOrTooCold(temp);

		var result =(new Date()).toString() + ',' + temp + '\r\n';

		fs.appendFile('message.txt', result, function (err) {
			if (err) throw err;
		});
	});
};

function isRoomTooHotOrTooCold(temperature)
{
	if(temperature > FAN_TEMPERATURE)
	{
		togglePlug(fanPlug,true);
		togglePlug(heaterPlug,false);
	}
	else  if(temperature < HEATER_TEMPERATURE)
	{
		togglePlug(fanPlug,false);
		togglePlug(heaterPlug,true);
	}
}

function togglePlug(plug,targetState)
{
	plug.getPowerState().then(
		function(currentState){
			if(targetState != currentState)
				plug.setPowerState(targetState).then(function(newState){
						plug.getSysInfo().then(function(info){
						console.log(info.alias + " is " + newState);
						if(info.alias == "Fan Plug" && newState)
							lirc_node.irsend.send_once("fanremote", "KEY_POWER", function() {
							  console.log("Sent Fan power command!");

								lirc_node.irsend.send_once("fanremote", "KEY_SHUFFLE", function() {
								  console.log("Sent Fan shuffle command!");
								});
							});
					});
				 });

	});

}



setInterval(	readTemperature		, 60000);
