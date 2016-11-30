'use strict';

import request from 'request'

// Methods to communicate with radio service
export default class PlayerService {
  constructor(radioId) {
    this.radioId = radioId;
  }

  getRadioConfig() {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.radioConfig = {
          streamUrl: "//edgeradio.streamon.fm/hlsts/EDGERADIO.m3u8",
          logoUrl: "edgeradio-logo.png"
        };
        resolve();
      }, 500);
      // request.get('server.json' + this.radioId, function (err, res, body) {
      //   if (err) console.log(err)
      //   console.log(body)
      // });
    });
    return promise
  };
};