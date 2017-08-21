# My First Home Automation Project
Are you excited about DIY automating your home? At least I did. We will see how we combine a bunch of different sensor, smart devices to work together including Raspberry Pi, Smart Plug, Temperature Sensor, IR Receiver and IR LED.
![HomeAutomation](https://github.com/polease/HomeAutomation/blob/master/HomeAutomation.jpeg)

My Daughter is 16 month old, we live in California with nice weather, we don't like air condition too much. One of the challenge we have is how to maintain a comfort temperature for her room. One day I thought, why don't I do a little experiment to do home automation via my little Raspberry PI to turn on and off the fan and heater.

> You may wondering why don't you use air condition, so this project just for my little experiment and we like fresh air :)

## Hardware
I already have a raw Raspberry Pi 3, i need a couple of sensors. 
1. **Temperature Sensor** to detect room temperature
2. **Smart Plug** to switch on and off fan and heater
3. **IR LED/Transmitter** to turn on my Dyson Cooler fan via IR remote control

For sensors, I am really happy with my Temperature Sensor from [SunFounder 37 Modules Sensor KitSensor](https://www.amazon.com/gp/product/B014PF05ZA/ref=oh_aui_detailpage_o07_s00?ie=UTF8&psc=1), it's much better(every sensor board has clear sensor name, with clear light indication and wiring label) than the [Quimat](https://www.amazon.com/gp/product/B06ZZ39PGF/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1) one i bought later for IR LED. I got two [TPLink HS110 Smart Plug](https://www.amazon.com/TP-Link-Monitoring-Required-Anywhere-HS110/dp/B0178IC5ZY). Later on, I found this great site <https://www.adafruit.com> as well for hardware purchase.

## Software
Raspberry you have multiple choices to run the application, seems like Python and NodeJs is pretty popular. I decide to experiment with NodeJs.

## Get Started
### Step 1 : Boot up and connect Raspberry Pi
Turns out raspberry pi have a nice desktop interface after i connect it to my TV via HDMI.  With a keyboard and mouse, i can easily find out the IP address of Pi, so i can move on with my Remote Desktop Manager, Or you can use Putty [Connect with Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/)

### Step 2 : Update NodeJS
The NodeJS on board with Raspberry Pi is really really old, and it also doesn't even have npm. So i reference [DaveJ's article](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/) to upgrade the node.

```Bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install nodejs
```

### Step 3 : Temperature Sensor (DS18B20) Installation
#### 3.1 Wire-up my wires for DS18B20
First of all, with all the Pins on the board, how should I wire them up. The SunFounder kit come with an GPIO board extension make my life much either, on the board it has all the pin indicator. 
![ds18b20](https://www.sunfounder.com/media/wysiwyg/swatches/sensor_kit_v2_0_for_b_plus/lesson-26-ds18b20-temperature-sensor/ds18b202.png)

#### 3.2 Driver installation
Seems like there a protocol called One Wire protocol need to be enabled. There are several good article out there can help you, i follow this article on [CircuitBasic](http://www.circuitbasics.com/raspberry-pi-ds18b20-temperature-sensor-tutorial/).

```command
sudo nano /boot/config.txt 
```
In the file, add following line, please add **gpiopin=4** (4 is the pin i used) there ( I found the solution article here in [stackexchange](https://raspberrypi.stackexchange.com/questions/28825/ds18b20-temperature-sensor-not-found)), many of article did not mention that, it would not work for me if i did not add that.
```Bash
dtoverlay=w1-gpio,gpiopin=4
```
```Bash
Sudo reboot
```
Now turn on the driver, and you should be able to see your temperature sensor device.
```Bash
sudo modprobe wire
sudo modprobe w1-gpio
sudo modprobe w1-therm
cd /sys/bus/w1/devices
ls
```
It turns out that each device has it's own folder, and they are writing temperature information into a file like thing. 

#### 3.3 Fire up via NodeJs
Great, so i can read temperature now via shell, but i need to read from my Node program, there must be someone doing this. I searched on npm, and found npm package [ds18b20](https://www.npmjs.com/package/ds18b20), [github code](https://github.com/chamerling/ds18b20) fit my purpose perfectly. Following is my Temeperature Reader js file.
```Javascript
var ds18b20 = require('ds18b20');
ds18b20.sensors(function(err, ids) {console.log(ids);});
ds18b20.temperature('28-0516a10f60ff', function(err, value) {
  console.log('Current temperature is', value*9/5+32);}
);
```

### Step 4. Smart Plug Installation
#### 4.1 Installing HS100
First step is connecting TPLink HS100 to my home wifi network, I downloaded the Kasa app from App Store. By following the instruction on the app, i was able to control the plug on/off with the Kasa app.

#### 4.2 Control Wifi Smart Plug TPLink HS100 via NodeJS
Next step is how to control the smart plug via NodeJS. In the beginning, i am a little disapointed that TPLink does not open their API, but after did some research, there are various people reverse engineering on the protocol of HS100, and even better, there is one person have built [HS100-api](https://github.com/plasticrake/hs100-api) NodeJS package. So with that, I quickly have my NodeJs code controlling the smart plug.
```Javascript
// Init Smart Power Plug
const Hs100Api = require('hs100-api');
const client = new Hs100Api.Client();
const fanPlug = client.getPlug({host: '192.168.31.105'});
const heaterPlug = client.getPlug({host: '192.168.31.19'});
// Init plug to off by default
fanPlug.setPowerState(false).then(console.log);
fanPlug.setPowerState(false).then(console.log);
```
### Step 5. IR(Infra Remote) Control my Dyson Cool Fan
When I started, I have no idea how IR works, so I would like to understand a little by reading the IR sensor input. The Sunfounder kit includes a IR Sensor and Universal Remote Control. 

#### 5.1 Wiring of IR Receiver
I follow Sunfounder's manual on the wiring as below, use GPIO 17 for Signal. The good part of any sensor from Sunfounder is that it has indicator LED light for both power and signal, which is pretty helpful for a new starter like me.
![IR Receiver](https://www.sunfounder.com/media/wysiwyg/swatches/sensor_kit_v2_0_for_b_plus/lesson-9-ir-receiver-module/grgfrgdf.png)

#### 5.2 Set up Driver for IR Receiver via LIRC
I followed this article in [ozzmaker](http://ozzmaker.com/how-to-control-the-gpio-on-a-raspberry-pi-with-an-ir-remote/) to set up the driver, and testing my sensor.

Turns out, there is a pretty standard library called Linux Infra Remote Control (LIRC) to driver the sensor. First to install the LIRC library.
```shell
sudo apt-get install lirc liblircclient-dev
```
Then add the two lines below to /etc/modules
```bash
lirc_dev
lirc_rpi gpio_in_pin=17
```
Edit your /boot/config.txt file and add:
```bash
dtoverlay=lirc-rpi,gpio_in_pin=17
```
Modify /etc/lirc/hardware.conf 
```bash
# /etc/lirc/hardware.conf
#
# Arguments which will be used when launching lircd
LIRCD_ARGS="--uinput"
 
# Don't start lircmd even if there seems to be a good config file
# START_LIRCMD=false
 
# Don't start irexec, even if a good config file seems to exist.
# START_IREXEC=false
 
# Try to load appropriate kernel modules
LOAD_MODULES=true
 
# Run "lircd --driver=help" for a list of supported drivers.
DRIVER="default"
# usually /dev/lirc0 is the correct setting for systems using udev
DEVICE="/dev/lirc0"
MODULES="lirc_rpi"
 
# Default configuration files for your hardware if any
LIRCD_CONF=""
LIRCMD_CONF=""
```
Reboot
Run this to quick test
```Bash
sudo /etc/init.d/lirc stop
pi@raspberrypi ~ $ mode2 -d /dev/lirc0
```
Quick test, when you press any button via your universal remote, you should see result print on your console, woohoo!

#### 5.3 Wiring up IR LED (sometimes called IR Transmitter)
Now I can read IR signal, the next step is to send IR signal. 

Since the Sunfounder kit does not come with the IR LED, i have to buy another one(I decide to buy another kit). I bought the [Quimat](https://www.amazon.com/gp/product/B06ZZ39PGF/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1), i almost returned the kit, but at the end i make it work. The Quimat kit is no way near friendly as Sunfounder one, no signal/power light, no even sensor name on the sensor board, i have to guess based on the shape of the sensor. 

Finally, i got it work with wiring of GPIO 27 (again, there is no light i can tell until i did the next step)

#### 5.4 Drive IR LED (sometimes called IR Transmitter)
I followed another great article by [Alaxba](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) to set up the driver. Here is the high level steps.

Modify the /etc/modules file <code>using sudo nano /etc/modules</code>
```bash
i2c-dev
lirc_dev
lirc_rpi gpio_in_pin=17 gpio_out_pin=27
```

The question comes, how to understand what kind of encoding of the IR signal is used by Dyson Cool Fan remote control? I was thinking this is hard, i did some research from Dyson company site, but nothing mentioned about the detail of Fan Remote Control. However, when i keep reading the same article in [ozzmaker](http://ozzmaker.com/how-to-control-the-gpio-on-a-raspberry-pi-with-an-ir-remote/), it turns out that LIRC package came with an out of box IR signal recorder called **irrecord** which is awesome. 

You use below command to record the signal from any of IR remote control.
```bash
irrecord -d /dev/lirc0 ~/lircd.conf
```
There are list of predefined name key to config, you can use below command to understand the list of Key can be named.
```bash
irrecord --list-namespace
```
I opened the config file and change the remote name to **fanremote** to differentiate. Now what you need to do is to copy the KEY signal definition file (lircd.conf) to the system folder, and restart LIRC service.
```bash
sudo cp lircd.conf /etc/lirc/lircd.conf
sudo /etc/init.d/lirc restart
```
After that, you can turn on IR Watch(irw) console app, when I press the key from my Dyson remote control, I can see the KEYs I just pressed from the console, amazing!
```bash
irw
```
Now i can use following a built-in tools called **irsend** to list out the Keys supported by fanremote, and also use it to send the IR signal, and it really turn on my fan, woohoo!
```bash
irsend LIST fanremote ""
irsend SEND_ONCE fanremote KEY_POWER
```

#### Step 5.5 Control Fan via NodeJS IR module
Alexbrain (the person who wrote the article above), he also published a NodeJS module called [lirc_node](https://github.com/alexbain/lirc_node) which fit my needs perfectly. Here is code I quickly leveraged.

```javascript
// Init IR remote control
lirc_node = require('lirc_node');
lirc_node.init();
lirc_node.irsend.send_once("fanremote", "KEY_POWER", function() {
  console.log("Sent Fan power command!");

  lirc_node.irsend.send_once("fanremote", "KEY_SHUFFLE", function() {
    console.log("Sent Fan shuffle command!");
  });
});
```
When i run the javascript, it not only turn on the fan, also it shuffle the fan's head, simple and great. Thanks Alex.

### Step 6. Run my automation as a service when system start
I would need my temperature automation start when system start and keep running. I followed this great article about different option of start service on [Execute Script from Stackexchange](https://raspberrypi.stackexchange.com/questions/8734/execute-script-on-start-up).

Create my shell script foreverStartup.sh under /Documents/Automaz/ with below content
```bash
sleep 8
cd /home/pi/Documents/Automaz
node room2.js >>/home/pi/Documents/Automaz/Log/output.log 2>>/home/pi/Documents/Automaz/Log/error.log
```
Change my script to executeable
```bash
sudo chmod 755 /home/pi/Documents/Automaz/foreverStartup.sh
```
Open .config/lxsession/LXDE-pi/autostart and add my line to system automatically start into LXDE
```bash
@./Documents/Automaz/foreverStartup.sh
```
Now, when i reboot, I can see the output.log file's content is increasing, also you can tell by following command.
```bash
ps -ef | grep node
```
Cool, we have my script run forever!

## Summary
Now, I have every technical piece done, i just need to write my simple program on detecting the temperature range and send command to turn on and off the heater and fan. 

In this project, it took me around 3 full days(50% time reading articles, 30% time wiring and coding, 20% time spent on writing this article here). Please star me on [github](https://github.com/polease/HomeAutomation) if you like it.

You can find all the integrated code in [room2.js](https://github.com/polease/HomeAutomation/blob/master/room2.js) file.
