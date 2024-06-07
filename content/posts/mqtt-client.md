---
title: "Building an MQTT Client"
date: 2024-06-07T09:59:07-07:00
---

The idea of writing my own [MQTT](https://mqtt.org/) client has always felt interesting and attainable. I know how the protocol works at a high level, and I've used various MQTT clients over the years, including [AWS IoT SDK](https://github.com/aws/aws-iot-device-sdk-java-v2), [MQTTX](https://mqttx.app/), and [mosquitto](https://github.com/eclipse/mosquitto).

After about a week of staring at the [MQTT 3.1.1 spec](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html), I built a client in C++ that can publish and subscribe to MQTT messages: https://github.com/jcosentino11/mqtt-client 🎉

```
mqtt sub --topic hello/topic --address broker.emqx.io:1883 --client-id mqttclient1
mqtt pub --topic hello/topic --address broker.emqx.io:1883 --client-id mqttclient2 '{"hello": "world"}'
```

It ended up being a great learning experience, espcially being a newcomer to C++ and lower-level networking (much of my career has been backend Java).

Here are some of my learnings (basic as they may be 🙂):
* I started by binding an IPv6 socket to an IP address (since the broker I was testing with was binding to IPv6), but later found out about `getaddrinfo`, which took care of DNS resolution and figuring out IPv4 vs IPv6, which was very convenient. [[commit]](https://github.com/jcosentino11/mqtt-client/commit/e20471b09249973c08dc0ce9851daff2d788e743)

```
struct addrinfo hints = {}, *addrs;
hints.ai_family = AF_UNSPEC;
hints.ai_socktype = SOCK_STREAM;
hints.ai_protocol = IPPROTO_TCP;

if (getaddrinfo(host.data(), port.data(), &hints, &addrs) != 0) {
    return;
}

for (struct addrinfo *addr = addrs; addr != NULL; addr = addr->ai_next) {
    mSock = socket(addr->ai_family, addr->ai_socktype, addr->ai_protocol);
    if (mSock == -1) {
        continue;
    }
    if (connect(mSock, addr->ai_addr, addr->ai_addrlen) < 0) {
        close(mSock);
        return;
    }
}
```
* I learned how to build packets byte-by-byte from looking at MQTT spec. Here's an example (adapted from [Packet.cpp](https://github.com/jcosentino11/mqtt-client/blob/7e5c31fd15f85866e3a22814ae155c44892f99b7/src/Packet.cpp#L103-L134)) of building a [SUBSCRIBE](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718063) packet:
```
std::vector<uint8_t> payload;
std::string topic = "example";

// FIXED HEADER
payload.push_back(0b10000010); // MQTT control packet type (8)
payload.push_back(2 + (3 + topic.size())); // remaining length
    
// VARIABLE HEADER
payload.push_back(0); // packet identifier MSB
payload.push_back(1234); // packet identifier LSB

// PAYLOAD
payload.push_back(0); // topic length MSB
payload.push_back(topic.size()); // topic length LSB
for (size_t i = 0; i < topic.size(); ++i) {
    payload.push_back(topic[i]);
}
payload.push_back(1); // QoS 1
```
* For testing, [wireshark](https://www.wireshark.org/) was invaluable. Using the filter `mqtt && tcp.port == 1883` on my loopback interface, I was able to compare packets sent from my client vs. a real one (such as MQTTX).

As I'm sure you already know, nothing beats hands-on learning, and this was no exception!
