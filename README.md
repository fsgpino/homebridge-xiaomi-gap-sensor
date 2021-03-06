# homebridge-xiaomi-gap-sensor
[![npm version](https://badge.fury.io/js/homebridge-xiaomi-gap-sensor.svg)](https://badge.fury.io/js/homebridge-xiaomi-gap-sensor)

a homebridge(https://github.com/nfarina/homebridge) plugin that get Xiaomi GAP Sensor temperature & humidity.

## Install
### Install bluetooth libraries before
BLE device can only be supported by Raspberry Pi 3. If you want to make sensor work with other hardware running homebridge, please try to install a bluetooth dongle and make sure it's working properly. Following is the procedure for Pi 3 users:

1. sudo apt-get install libbluetooth-dev

2. sudo npm install -g --unsafe-perm noble

3. sudo apt-get install libcap2-bin

4. Run following command:
```sh
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
``` 

5. Install homebridge-xiaomi-gap-sensor and config homebridge plugin.
```
sudo npm install -g homebridge-xiaomi-gap-sensor
``` 

### Configuration
You need to add this configuration to homebridge.
```
"accessories": [{
    "accessory" : "XiaomiGAPSensor",
    "name" : "Mi Temperature and Humidity Monitor",
    "address" : "<mac-address>",
    "version" : "1.0.1",
    "scanning": true
}]
```
To find the mac address use the following command.
```
# node /usr/lib/node_modules/homebridge-xiaomi-gap-sensor/scan.js
```

## Supported sensors
### Xiaomi Mijia Bluetooth Temperature and Humidity sensor (with LCD)
This sensor is fully supported in normal operation. The plugin is able to read Temperature, Humidity and battery levels from frames.

## Version Logs
### 0.0.4
1.fix name.
### 0.0.3
1.fix bug.
### 0.0.2
1.publish to www.npmjs.com.
### 0.0.1
1.get Xiaomi GAP Sensor temperature, humidity & battery.   
