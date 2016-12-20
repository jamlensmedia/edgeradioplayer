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
            startingVolume: parseInt(serverConfig.starting_volume) || 100,
            autoplay: serverConfig.autoplay || "true",
            streamUrl: serverConfig.stream_url,
            streamPlaylistUrl: serverConfig.stream_playlist,
            logoImage: serverConfig.radio_logo_url || 'edgeradio-logo-small.png',
            logoLink: serverConfig.logo_link || 'http://www.edgestreamingradio.com',
            background: serverConfig.radio_background || '#344557',
          };
          resolve();
        });
    });
    return promise
  };
};