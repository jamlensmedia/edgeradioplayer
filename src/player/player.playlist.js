'use strict';

import request from 'request'

// Class to manage radio playlist
export default class PlayerPlaylist {
  constructor() {
  }

  getCurrentSong() {
    let promise = new Promise((resolve, reject) => {
      this.getPlayerMetadata().then((metadata) => {
        let currentSong = metadata[metadata.length - 1];

        resolve(currentSong);
      });
    });
    return promise;
  };

  getPlayerMetadata() {
    let promise = new Promise((resolve, reject) => {
      request.get('//edgeradio.streamon.fm/metadata/recentevents/EDGERADIO-48k.json',
        function (err, res, body) {
          if (err) reject(err);
          this.metadata = JSON.parse(body);
          resolve(this.metadata);
      });
    });
    return promise
  };
};