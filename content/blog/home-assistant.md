---
title: "Running Home Assistant"
date: 2024-05-01T21:06:48-07:00
---

Home automation is super fun. You get to control all of your home gadgets from a single place and write automations to ~~make life easier~~ annoy your spouse.

My setup is a Raspberry Pi 4 running [Home Assistant OS](https://www.home-assistant.io/installation/raspberrypi#install-home-assistant-operating-system), which has been holding steady for years now. At the time of writing, roughly a quarter of my RAM and storage is being used, so plenty of room to grow still.

Currently, I have my TV, air conditioners, printer, speakers, security system, hooked up to this thing (you can see I have a fairly high risk tolerance 😬). I can see the status (current and historical) of all these devices, control them, and make fancy dashboards, like this one:

![Home Assistant Panel](panel.png)


Here are my unsolicited add-on recommendations:

If you want to hook up Ring security, you'll need
* [Ring-MQTT with Video Streaming](https://github.com/tsightler/ring-mqtt)
* [Mosquitto Broker](https://github.com/home-assistant/addons/blob/master/mosquitto/DOCS.md)

It's pretty neat. Home assistant will be able to hook into MQTT messages coming from your doorbells, alarms, etc. This also means you can use it to drive automations; here's one, written in [NodeRED](https://nodered.org/) that shuts off my TV (via a [web API call](https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md) to my Roku) when security is armed (aka. leaving the house):

![NodeRED example](node-red-example.png)

What a time to be alive 😉

Dev-friendly add-ons:
* [Node-RED](https://community.home-assistant.io/t/home-assistant-community-add-on-node-red/55023)
* [Studio Code Server](https://community.home-assistant.io/t/home-assistant-community-add-on-visual-studio-code/107863)
* [Terminal & SSH](https://community.home-assistant.io/t/home-assistant-community-add-on-ssh-web-terminal/33820)

While I usually avoid visual programming environments (I had a really bad experience with LabView as a kid), NodeRED works great and feels more ergonomic than working with Home Assistant's native automations. I've never found myself needing to write complex or long automations, so it's been pretty manegable so far.

And lastly:
* [Home Assistant Google Drive Backup](https://community.home-assistant.io/t/add-on-home-assistant-google-drive-backup/107928)
    * Because you don't want to rebuild your duct tape castle from scratch...
* [AdGuard Home](https://www.home-assistant.io/integrations/adguard/)
    * DNS-level ad blocking, good for your home network and your soul
