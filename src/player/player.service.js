'use strict';

import request from 'request'

// Methods to communicate with radio service
export default class PlayerService {
  constructor(radioId) {
    this.radioId = radioId;
  }

  getRadioConfig(callback) {
    request.get('http://edgeradio.pairserver.com/wp-json/wp/v2/radio/' + this.radioId,
      (err, res, body) => {
      if (err) console.log(err);
        let serverConfig = JSON.parse(body);
        this.radioConfig = {
          startingVolume: parseInt(serverConfig.starting_volume) || 100,
          autoplay: serverConfig.autoplay || "true",
          streamUrl: serverConfig.stream_url,
          whiteText: serverConfig.white_text || "On Demand",
          whiteTextLink: serverConfig.white_text_link || "http://www.seacoastonline.com/news/20161209/edge-radio-audio-archives",
          orangeText: serverConfig.orange_text || "Radio:",
          adImage: serverConfig.ad_image,
          adLink: serverConfig.ad_link,
          streamPlaylistUrl: serverConfig.stream_playlist,
          type: serverConfig.type,
          logoImage: serverConfig.radio_logo_url || 'edgeradio-logo-small.png',
          logoLink: serverConfig.logo_link || 'http://www.edgestreamingradio.com',
          background: serverConfig.radio_background || '#344557',
        };
        callback();
      });
  };
};