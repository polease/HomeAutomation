
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const fanPlug = client.getPlug({host: '192.168.31.105'});
const heaterPlug = client.getPlug({host: '192.168.31.19'});
// Init plug to off by default
fanPlug.setPowerState(false).then(console.log);
fanPlug.setPowerState(false).then(console.log);
var fanPlugPowerOn = false;
var heaterPlugPowerOn = false;


var ds18b20 = require('ds18b20');
var fs = require('fs');

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
			console.log('Saved!');
		});
	});
};

function isRoomTooHotOrTooCold(temperature)
{
	if(temperature > 78.5)
	{
		togglePlug(fanPlug,true);
		togglePlug(heaterPlug,false);
	}
	else  if(temperature < 76)
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
					});
				 });

	});

}



setInterval(	readTemperature		, 5000);
