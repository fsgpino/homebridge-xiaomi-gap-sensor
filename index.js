var Accessory, Service, Characteristic, UUIDGen;

const fs = require('fs');
const noble = require('noble');
const XiaomiGAPServiceReader = require('xiaomi-gap-parser');
const packageFile = require("./package.json");

module.exports = function(homebridge) {

	if(!isConfig(homebridge.user.configPath(), "accessories", "XiaomiGAPSensor")) {
		return;
	}

	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	homebridge.registerAccessory('homebridge-xiaomi-gap-sersor', 'XiaomiGAPSensor', XiaomiGAPSensor);

}

function isConfig(configFile, type, name) {

	var config = JSON.parse(fs.readFileSync(configFile));

	if("accessories" === type) {
		var accessories = config.accessories;
		for(var i in accessories) {
			if(accessories[i]['accessory'] === name) {
				return true;
			}
		}
	} else if("platforms" === type) {
		var platforms = config.platforms;
		for(var i in platforms) {
			if(platforms[i]['platform'] === name) {
				return true;
			}
		}
	} else {
		return false;
	}

}

function XiaomiGAPSensor(log, config) {

	if (null == config) {
		return;
	}

	this.log = log;
	this.name = config["name"];
	this.address = config["address"].toLowerCase();
	this.version = config["version"];

	if (config["scanning"] === true) {
		noble.on('stateChange', function(state) {
			if (state === 'poweredOn') {
				noble.startScanning([config["address"].toLowerCase().replace(':','')], true);
			} else {
				noble.stopScanning();
			}
		});
	}

}

XiaomiGAPSensor.prototype = {
	getServices: function() {

		var that = this;

		var currentTemperature = 0.0;
		var currentHumidity = 0.0;
		var batteryLevel = 100;

		var infoService = new Service.AccessoryInformation();
		infoService
			.setCharacteristic(Characteristic.Manufacturer, "Mijia")
			.setCharacteristic(Characteristic.Model, "Mi Temperature and Humidity Monitor")
			.setCharacteristic(Characteristic.SerialNumber, that.address.toUpperCase())
			.setCharacteristic(Characteristic.FirmwareRevision, that.version);

		var temperatureSensor = new Service.TemperatureSensor(that.name);
		var currentTemperatureCharacteristic = temperatureSensor.getCharacteristic(Characteristic.CurrentTemperature);
		currentTemperatureCharacteristic.updateValue(currentTemperature);

		var humiditySensor = new Service.HumiditySensor(that.name);
		var currentHumidityCharacteristic = humiditySensor.getCharacteristic(Characteristic.CurrentRelativeHumidity);
		currentHumidityCharacteristic.updateValue(currentHumidity);

		var batteryService  = new Service.BatteryService(that.name);
		var currentBatteryLevelCharacteristic = batteryService.getCharacteristic(Characteristic.BatteryLevel);
		var currentChargingStateCharacteristic = batteryService.getCharacteristic(Characteristic.ChargingState);
		var currentStatusLowBatteryCharacteristic = batteryService.getCharacteristic(Characteristic.StatusLowBattery);
		currentBatteryLevelCharacteristic.updateValue(batteryLevel);
		currentChargingStateCharacteristic.updateValue(Characteristic.ChargingState.NOT_CHARGEABLE);
		currentStatusLowBatteryCharacteristic.updateValue(batteryLevel >= 20 ? 0 : 1);

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

			if (typeof xiaomiDataDecoded.event !== 'undefined') {
				if (typeof xiaomiDataDecoded.mac !== 'undefined') {
					if (that.address != address) {
						return;
					}
				} else {
					return;
				}
				if (typeof xiaomiDataDecoded.event.data !== 'undefined') {
					if (typeof xiaomiDataDecoded.event.data.tmp !== 'undefined') {
						currentTemperature = parseFloat(xiaomiDataDecoded.event.data.tmp);
					}
					if (typeof xiaomiDataDecoded.event.data.hum !== 'undefined') {
						currentHumidity = parseFloat(xiaomiDataDecoded.event.data.hum);
					}
					if (typeof xiaomiDataDecoded.event.data.bat !== 'undefined') {
						batteryLevel = parseFloat(xiaomiDataDecoded.event.data.bat);
					}
				}
			}

			currentTemperatureCharacteristic.updateValue(currentTemperature);
			currentHumidityCharacteristic.updateValue(currentHumidity);
			currentBatteryLevelCharacteristic.updateValue(batteryLevel);
			currentChargingStateCharacteristic.updateValue(Characteristic.ChargingState.NOT_CHARGEABLE);
			currentStatusLowBatteryCharacteristic.updateValue(batteryLevel >= 20 ? 0 : 1);

		});

		currentTemperatureCharacteristic.on('get', (callback) => {
			callback(null, currentTemperature);
		});

		currentHumidityCharacteristic.on('get', (callback) => {
			callback(null, currentHumidity);
		});

		currentBatteryLevelCharacteristic.on('get', (callback) => {
			callback(null, batteryLevel);
		});

		currentChargingStateCharacteristic.on('get', (callback) => {
			callback(null, Characteristic.ChargingState.NOT_CHARGEABLE);
		});

		currentStatusLowBatteryCharacteristic.on('get', (callback) => {
			callback(null, batteryLevel >= 20 ? 0 : 1);
		});

		return [infoService, temperatureSensor, humiditySensor, batteryService];

	}
}

