
const noble = require('noble');
const XiaomiGAPServiceReader = require('xiaomi-gap-parser');

noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning([], true);
		console.log("Searching sensors...");
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {
	const {advertisement, id, rssi, address} = peripheral;
	const {localName, serviceData, serviceUuids} = advertisement;
	let xiaomiData = null;

	for (let i in serviceData) {
		if (serviceData[i].uuid.toString('hex') === 'fe95') {
			xiaomiData = serviceData[i].data;
		}
	}

	if (!xiaomiData) return;

	let xiaomiDataDecoded = XiaomiGAPServiceReader.readServiceData(xiaomiData);

	var response = "";

	if (typeof xiaomiDataDecoded.event !== 'undefined') {

		if (typeof xiaomiDataDecoded.mac !== 'undefined') {
			response = "Sensor " + address + " with rssi:" + rssi + " detected:";
		} else {
			return;
		}

		if (typeof xiaomiDataDecoded.event.data !== 'undefined') {
			if (typeof xiaomiDataDecoded.event.data.tmp !== 'undefined') {
				response += " Temperature: " + xiaomiDataDecoded.event.data.tmp + "ºC";
			}
			if (typeof xiaomiDataDecoded.event.data.hum !== 'undefined') {
				response += " Humidity: " + xiaomiDataDecoded.event.data.hum + "%";
			}
			if (typeof xiaomiDataDecoded.event.data.bat !== 'undefined') {
				response += " Battery: " + xiaomiDataDecoded.event.data.bat + "%";
			}
		}
	}

	console.log(response);

});
