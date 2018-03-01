# homebridge-xiaomi-gap-sensor

a homebridge(https://github.com/nfarina/homebridge) plugin that get Xiaomi GAP Sensor temperature & humidity.

## Configuration
```
"accessories": [{
    "accessory" : "XiaomiGAPSensor",
    "name" : "Mi Temperature and Humidity Monitor",
    "address" : "<mac-address>",
    "version" : "1.0.1",
    "scanning": true
}]
```

## Version Logs
### 0.0.1
1.get Xiaomi GAP Sensor temperature, humidity & battery.   
