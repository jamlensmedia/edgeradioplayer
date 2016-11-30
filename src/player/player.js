'use strict';

import PlayerInterface from './player.interface';
import PlayerPlaylist from './player.playlist';
import Hls from 'hls.js';
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
    this.streamStarted = false;

    this.config = this.initConfig(config);
    this.initPlayer(element, radioId);

  };

  initPlayer(element, radioId) {
    this.service = new PlayerService(radioId);
    this.service.getRadioConfig().then(() => {
      this.interface = new PlayerInterface(element, this.service, this);
      this.playlist = new PlayerPlaylist();

      this.startStream();

      this.playlist.getCurrentSong().then((currentSong) => {
        this.interface.setCurrentSong(currentSong);
      });
    });
  }

  startStream() {
    if(Hls.isSupported() && !this.streamStarted) {
      var hls = new Hls();
      hls.loadSource(this.service.radioConfig.streamUrl);
      hls.attachMedia(this.interface.player);
      hls.on(Hls.Events.MANIFEST_PARSED,() => {
        this.streamStarted = true;
        this.interface.player.play();
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event,data) => {
        if(this.streamStarted) {
          this.playlist.getCurrentSong().then((currentSong) => {
            this.interface.setCurrentSong(currentSong);
          });
        }
      });
    }
  }

  initConfig(config) {
    config = config || {};
    Object.assign(this.defaultConfig, config);

    return config;
  }

  playAudio(url, name) {
    this.streamStarted = false;
    this.interface.setDisplayLabel('Playing: ');
    this.interface.setDisplayContent(name);
    this.interface.player.src = url;
    this.interface.player.play();
  }
}
