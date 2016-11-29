'use strict';

import PlayerInterface from './player.interface';
import PlayerPlaylist from './player.playlist';
import PlayerService from './player.service';

export default class EdgeRadioPlayer {
  constructor(element, radioId, config) {
    if (!element) {
      console.error("You must have an element selected for the Edge Radio to load correctly.  " +
        "This could be caused by loading the script too early.");
    }
    if (!radioId) {
      console.error("A radio ID is required to load Edge Radio");
    }

    this.defaultConfig = {
      positioning: 'fixed',
      disableCss: false
    };

    this.config = this.initConfig(config);
    this.initPlayer(element, radioId);
  };

  initPlayer(element, radioId) {
    this.service = new PlayerService(radioId);
    this.service.getRadioConfig().then(() => {
      this.interface = new PlayerInterface(element, this.service);
      this.playlist = new PlayerPlaylist();
      this.playlist.getCurrentSong().then((currentSong) => {
        this.interface.setCurrentSong(currentSong);
      });
    });
  }

  initConfig(config) {
    config = config || {};
    Object.assign(this.defaultConfig, config);

    return config;
  }
}