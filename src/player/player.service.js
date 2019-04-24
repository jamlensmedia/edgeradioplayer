'use strict';

import request from 'request'

// Methods to communicate with radio service
export default class PlayerService {
  constructor(radioId) {
    this.radioId = radioId;
  }

  getRadioConfig(callback) {
    request.get('https://ghradioplayer.com/wp-json/wp/v2/radio/' + this.radioId,
      (err, res, body) => {
      if (err && console) console.error(err);
        let serverConfig = JSON.parse(body);
        let autoplay = serverConfig.autoplay || "true";

        if(autoplay == "false") {
          let autoplayConfig = {
            start_auto_play: parseInt(serverConfig.start_auto_play),
            stop_auto_play: parseInt(serverConfig.stop_auto_play),
            days: [
              serverConfig.day_of_week_sunday == "1",
              serverConfig.day_of_week_monday == "1",
              serverConfig.day_of_week_tuesday == "1",
              serverConfig.day_of_week_wednesday == "1",
              serverConfig.day_of_week_thursday == "1",
              serverConfig.day_of_week_friday == "1",
              serverConfig.day_of_week_saturday == "1"
            ]
          };
          let date = new Date();
          // if it can autoplay today
          if(autoplayConfig.days[date.getDay()]) {
            let currentHour = date.getHours();
            if(currentHour >= autoplayConfig.start_auto_play && currentHour < autoplayConfig.stop_auto_play) {
              // Should autoplayConfig
              autoplay = "true";
            }
          }
        }

        this.radioConfig = {
          startingVolume: parseInt(serverConfig.starting_volume) || 0,
          ajax: serverConfig.ajax || "false",
          autoplay: autoplay,
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
