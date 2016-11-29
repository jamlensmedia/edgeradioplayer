'use strict';

import request from 'request'

// Methods to communicate with radio service
export default class PlayerService {
  constructor(radioId) {
    this.radioId = radioId;
  }

  getRadioConfig() {å
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.radioConfig = {
          streamUrl: "sample.mp3",
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