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
        let autoplayLog = [];
        let autoplay = serverConfig.autoplay || "true";
        autoplayLog.push({message: 'Server config set autoplay to ' + autoplay, autoplayState: autoplay});

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
              autoplayLog.push({message: 'Scheduled autoplay set autoplay to ' + autoplay, autoplayState: autoplay});
            }
          }
        } else {
          autoplayLog.push({message: 'Not using scheduled autoplay due to autoplay already true', autoplayState: autoplay});
        }

        // don't autoplay if user is logged in
        if(typeof __gh__coreData !== 'undefined') {
          if(typeof __gh__coreData["user"] !== 'undefined') {
            if(typeof __gh__coreData["user"]["isSubscriber"] !== 'undefined' && __gh__coreData["user"]["isSubscriber"] == true) {
              autoplay = "false";
              autoplayLog.push({message: 'User logged in set autoplay to ' + autoplay, subscriberValue: __gh__coreData["user"]["isSubscriber"], autoplayState: autoplay});
            }
          }
        }
        if(this.getCookie('radio_cookie_autoplay') == 'true') {
          autoplay = "true";
          autoplayLog.push({message: 'Autoplay cookie set to ' + autoplay, cookieValue: this.getCookie('radio_cookie_autoplay'), autoplayState: autoplay});
        } else if(this.getCookie('radio_cookie_autoplay') == 'false') {
          autoplay = "false";
          autoplayLog.push({message: 'Autoplay cookie set to ' + autoplay, cookieValue: this.getCookie('radio_cookie_autoplay'), autoplayState: autoplay});
        }

        // don't autoplay radio if arcticle contains youtube video autoplaying
        if(typeof __gh__coreData !== 'undefined') {
          if(typeof __gh__coreData["globalVariables"] !== 'undefined') {
            if(typeof __gh__coreData["globalVariables"]["ads"] !== 'undefined') {
              if(typeof __gh__coreData["globalVariables"]["ads"]["youTubeAutoPlay"] !== 'undefined' && __gh__coreData["globalVariables"]["ads"]["youTubeAutoPlay"] == true) {
                autoplay = "false";
                autoplayLog.push({message: 'Youtube Autoplay set to true, set autoplay to ' + autoplay, youTubeAutoPlayValue: __gh__coreData["globalVariables"]["ads"]["youTubeAutoPlay"], autoplayState: autoplay});
              }
            }
          }
        }

        autoplayLog.push({message: 'Final autoplay setting is ' + autoplay, autoplayState: autoplay});

        this.radioConfig = {
          startingVolume: parseInt(serverConfig.starting_volume) || 0,
          ajax: serverConfig.ajax || "false",
          autoplay: autoplay,
          autoplayLog: autoplayLog,
          streamUrl: serverConfig.stream_url,
          title: serverConfig.title.rendered || 'Loading...',
          whiteText: serverConfig.white_text || "On Demand",
          whiteTextLink: serverConfig.white_text_link || "http://www.seacoastonline.com/news/20161209/edge-radio-audio-archives",
          orangeText: serverConfig.orange_text || "Radio:",
          adImage: serverConfig.ad_image,
          adLink: serverConfig.ad_link,
          liveLink: serverConfig.radio_live_link || "http://edgeradio.streamon.fm",
          streamPlaylistUrl: serverConfig.stream_playlist,
          trackingParams: serverConfig.tracking_params || '',
          type: serverConfig.type,
          logoImage: serverConfig.radio_logo_url || 'edgeradio-logo-small.png',
          logoLink: serverConfig.logo_link || 'http://www.edgestreamingradio.com',
          liveImage: serverConfig.live_image || 'http://edgeradio.pairserver.com/listen-live.jpg',
          background: serverConfig.radio_background || '#344557',
          radio_toggle_background: serverConfig.radio_toggle_background || '#000000',
          radio_toggle_on_text_color: serverConfig.radio_toggle_on_text_color || '#ea8821',
          radio_toggle_off_text_color: serverConfig.radio_toggle_off_text_color || '#ff0000'
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

  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  };

};
