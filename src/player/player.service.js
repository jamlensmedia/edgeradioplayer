'use strict';

import request from 'request'

// Methods to communicate with radio service
export default class PlayerService {
  constructor(radioId) {
    this.radioId = radioId;
  }

  getRadioConfig() {
    let promise = new Promise((resolve, reject) => {
      request.get('http://edgeradio.pairserver.com/wp-json/wp/v2/radio/' + this.radioId,
         (err, res, body) => {
          if (err) console.log(err);
          let serverConfig = JSON.parse(body);
          this.radioConfig = {
            streamUrl: serverConfig.stream_url,
            streamPlaylistUrl: serverConfig.stream_playlist,
            logoImage: serverConfig.logo_image || 'edgeradio-logo-small.png',
            logoLink: serverConfig.logo_link || 'http://www.edgestreamingradio.com',
            background: serverConfig.radio_background || '#344557',
          };
          resolve();
        });
    });
    return promise
  };
};