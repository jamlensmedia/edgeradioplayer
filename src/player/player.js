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
    this.firstLoad = true;
    this.tritonCurrentSong = {
      TPE1: '',
      TIT2: ''
    };

    this.config = this.initConfig(config);
    this.initPlayer(element, radioId);

    setInterval(() => {
      this.getMp3Links();
    }, 1000);
    this.getMp3Links();
  };

  getMp3Links() {
    var links = document.body.getElementsByTagName("a");
    for (var i = 0; i < links.length; ++i) {
      if(links[i].href.indexOf('.mp3') !== -1) {
        if (!links[i].radioAttached) {
          links[i].radioAttached = true;
          links[i].addEventListener('click', (event) => {
            event.preventDefault();
            this.playAudio(event.target.href, event.target.text);
          })
        }
      }
    }
  }

  initPlayer(element, radioId) {
    this.service = new PlayerService(radioId);
    this.service.getRadioConfig(() => {
      this.interface = new PlayerInterface(element, this.service, this);
      this.playlist = new PlayerPlaylist(this);


      if(this.service.radioConfig.type === 'streamOn') {
        this.playlist.getCurrentSong().then((currentSong) => {
          this.interface.setCurrentSong(currentSong);
        });
      }

      this.startStream();
    });
  }

  startStream() {
    if(this.firstLoad === true && this.service.radioConfig.autoplay == "false") {
      this.interface.playPauseControl.classList.add('paused');
      this.firstLoad = false;
    } else if(this.service.radioConfig.type === 'streamOn') {
      if(Hls.isSupported() && !this.streamStarted) {
        var config = {
          debug: false
        };
        var hls = new Hls(config);
        hls.loadSource(this.service.radioConfig.streamUrl);
        hls.attachMedia(this.interface.player);
        hls.on(Hls.Events.MANIFEST_PARSED,() => {
          this.streamStarted = true;
          this.interface.player.play();
          this.interface.playPauseControl.classList.remove('paused');
        });

        hls.on(Hls.Events.LEVEL_LOADED, (event,data) => {
          if(this.streamStarted) {
            this.updateSong(data.stats);
          }
        });
        this.hls = hls;
      } else if(!this.streamStarted) {
        this.streamStarted = true;
        this.interface.player.src = this.service.radioConfig.streamUrl;
        this.interface.playPause();
        if(this.interface.player.paused) {
          this.interface.playPauseControl.classList.add('paused');
        }
      }
    } else if(this.service.radioConfig.type === 'triton') {
      //Player SDK is ready to be used, this is where you can instantiate a new TDSdk instance.
      //Player configuration: list of modules
      var tdPlayerConfig = {
        coreModules: [{
          id: 'MediaPlayer',
          playerId: this.interface.container.id,
          techPriority:['Html5', 'Flash']
        },{
          id: 'NowPlayingApi'
        }],
        playerReady: (e) => this.onTritonPlayerReady(e)
      };
      //Player instance
      this.player = new TDSdk( tdPlayerConfig );
    }
  }


  onTritonPlayerReady() {
    this.player.addEventListener( 'track-cue-point', (e) => {
      this.onTrackCuePoint(e)
    } );
    this.player.addEventListener( 'speech-cue-point', (e) => {
      this.onTrackCuePoint(e)
    } );
    this.player.addEventListener( 'ad-break-cue-point', (e) => {
      this.onTrackAdCuePoint(e)
    } );

    this.player.addEventListener( 'list-loaded', (e) => this.onListLoaded(e) );
    this.player.NowPlayingApi.load( {
      mount:this.service.radioConfig.streamUrl,
      hd:true,
      numberToFetch:10,
      eventType:'track'
    } );
    this.tritonCurrentSong = {
      TPE1: this.service.radioConfig.title,
      TIT2: ''
    };
    this.tritonSetVolume(Math.abs(this.service.radioConfig.startingVolume - 100)/100);
    this.tritonPlay();
  }

  tritonPlay() {
    if(this.tritonCurrentSong.TPE1 !== "") {
      this.interface.setCurrentSong(this.tritonCurrentSong);
    }
    this.player.play( {mount: this.service.radioConfig.streamUrl} );
  }

  tritonPause() {
    this.player.stop();
  }

  tritonSetVolume(volume) {
    if(this.player) {
      this.player.setVolume(volume);
    }
  }

  onListLoaded( e )
  {
    //Display now playing information in the "onair" div element.
    //document.getElementById('onair').innerHTML = 'Artist: ' + e.data.cuePoint.artistName + '<BR>Title: ' + e.data.cuePoint.cueTitle;
  }

  onTrackAdCuePoint(e) {
    if(e.data) {
      if(e.data.adBreakData) {
        if(typeof e.data.adBreakData.cueTitle === 'string') {
          let currentTrack = {
            TPE1: e.data.adBreakData.cueTitle,
            TIT2: ''
          };
          this.tritonCurrentSong = currentTrack;
        }
        this.interface.setCurrentSong(this.tritonCurrentSong);
      }
    }
  }

  onTrackCuePoint( e )
  {
    if(e.data) {
      if(e.data.cuePoint) {
        if(typeof e.data.cuePoint.artistName === 'string' &&
          typeof e.data.cuePoint.cueTitle === 'string') {
          let currentTrack = {
            TPE1: e.data.cuePoint.artistName,
            TIT2: e.data.cuePoint.cueTitle
          };
          this.tritonCurrentSong = currentTrack;
        }
        this.interface.setCurrentSong(this.tritonCurrentSong);
      }
    }
  }

  stopStream() {
    if(this.hls && Hls.isSupported()) {
      this.hls.destroy();
      this.streamStarted = false;
    }
  }

  updateSong(stats, force) {
    this.playlist.getCurrentSong(stats).then((currentSong) => {
      this.interface.setCurrentSong(currentSong);
    });
  }

  initConfig(config) {
    config = config || {};
    // Object.assign(this.defaultConfig, config);

    return config;
  }

  playAudio(url, name) {
    if(this.service.radioConfig.type === 'triton'){
      this.tritonPause();
    } else {
      this.streamStarted = false;
    }
    this.interface.setDisplayLabel('Playing: ');
    this.interface.setDisplayContent(name);
    this.interface.player.src = url;
    this.interface.player.play();

    this.interface.player.addEventListener("ended", () =>
    {
      if(this.service.radioConfig.type === 'triton'){
        this.tritonPlay();
      } else {
        this.startStream();
        this.interface.player.play();
      }
    });
  }
}
