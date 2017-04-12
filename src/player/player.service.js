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
      if (err && console) console.error(err);
        let serverConfig = JSON.parse(body);
        this.radioConfig = {
          startingVolume: parseInt(serverConfig.starting_volume) || 0,
          ajax: serverConfig.ajax || "false",
          autoplay: serverConfig.autoplay || "true",
          streamUrl: serverConfig.stream_url,
          title: serverConfig.title.rendered || 'Loading...',
          whiteText: serverConfig.white_text || "On Demand",
          whiteTextLink: serverConfig.white_text_link || "http://www.seacoastonline.com/news/20161209/edge-radio-audio-archives",
          orangeText: serverConfig.orange_text || "Radio:",
          adImage: serverConfig.ad_image,
          adLink: serverConfig.ad_link,
          liveLink: serverConfig.radio_live_link || "http://edgeradio.streamon.fm",
          streamPlaylistUrl: serverConfig.stream_playlist,
          type: serverConfig.type,
          logoImage: serverConfig.radio_logo_url || 'edgeradio-logo-small.png',
          logoLink: serverConfig.logo_link || 'http://www.edgestreamingradio.com',
          liveImage: serverConfig.live_image || 'http://edgeradio.pairserver.com/listen-live.jpg',
          background: serverConfig.radio_background || '#344557',
        };

        this.radioConfig.dropDownLinks = [];

        if(serverConfig.white_text_dropdown_label_1 !== '') {
          this.radioConfig.dropDownLinks.push({
            label: serverConfig.white_text_dropdown_label_1,
            link: serverConfig.white_text_dropdown_link_1
          });
        }
        if(serverConfig.white_text_dropdown_label_2 !== '') {
          this.radioConfig.dropDownLinks.push({
            label: serverConfig.white_text_dropdown_label_2,
            link: serverConfig.white_text_dropdown_link_2
          });
        }
        if(serverConfig.white_text_dropdown_label_3 !== '') {
          this.radioConfig.dropDownLinks.push({
            label: serverConfig.white_text_dropdown_label_3,
            link: serverConfig.white_text_dropdown_link_3
          });
        }
        if(serverConfig.white_text_dropdown_label_4 !== '') {
          this.radioConfig.dropDownLinks.push({
            label: serverConfig.white_text_dropdown_label_4,
            link: serverConfig.white_text_dropdown_link_4
          });
        }
        if(serverConfig.white_text_dropdown_label_5 !== '') {
          this.radioConfig.dropDownLinks.push({
            label: serverConfig.white_text_dropdown_label_5,
            link: serverConfig.white_text_dropdown_link_5
          });
        }

        callback();
      });
  };
};