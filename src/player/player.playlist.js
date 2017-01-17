'use strict';

import request from 'request'

// Class to manage radio playlist
export default class PlayerPlaylist {
  constructor(controller) {
    this.playerController = controller;
  }

  getCurrentSong() {
    let promise = new Promise((resolve, reject) => {
      this.getPlayerMetadata().then((metadata) => {
        let timestamp = new Date((parseInt(metadata[metadata.length - 1].TXXX_event_id)+20)*1000);
        let currentSong = metadata[metadata.length - 1];

        if(new Date() > timestamp) {
          resolve(currentSong);
        }
      });
    });
    return promise;
  };
  
  getPlayerMetadata() {
    let promise = new Promise((resolve, reject) => {
      request.get(this.playerController.service.radioConfig.streamPlaylistUrl,
        function (err, res, body) {
          if (err) reject(err);
          this.metadata = JSON.parse(body);
          resolve(this.metadata);
      });
    });
    return promise
  };
};