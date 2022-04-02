# Apex Challenge Tracker
Challenge tracker and optimizer for Apex Legends.

Enter your challenges, and the site will show you which legends to use, modes to play, and weapons to use to maximize your battle pass point gain.

See the help on the site for usage tips.

Published website: http://apex.elec0.com

## Building
Written in typescript because it is marginally acceptable over javascript.

To compile and start a local (Python) webserver, run
```
npm install
npm run dev
```

My website can't run Node, so I wrote it such that it runs without that. It's a purely frontend site that uses the `localStorage` part of the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

I tried to write it in some kind of not-stupid way, but I haven't done much with web recently, so most of this is new to me.