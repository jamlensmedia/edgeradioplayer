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

  mobileAndTabletcheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  startStream() {
    if(this.service.radioConfig.type === 'streamOn') {
      if((this.firstLoad === true && this.service.radioConfig.autoplay == "false")) {
        this.interface.controlPause();
        this.firstLoad = false;
      } else  {
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
            this.interface.controlPlay();
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
            this.interface.controlPause();
          }
        }
      }
    }
    if(this.service.radioConfig.type === 'triton') {
      var imported = document.createElement('script');
      imported.src = '//sdk.listenlive.co/web/2.9/td-sdk.min.js';
      document.head.appendChild(imported);
      this.tritonRetry();
    }
  }

  tritonRetry() {
    if(typeof TDSdk !== 'undefined'){
      this.startTriton()
    } else {
      setTimeout(() => this.tritonRetry(), 300);
    }
  }

  startTriton() {
    if(this.firstLoad === true && this.service.radioConfig.autoplay == "false") {
      this.interface.controlPause();
      this.firstLoad = false;
    }
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
    this.tritonGetSongList();
    this.tritonCurrentSong = {
      TPE1: this.service.radioConfig.title,
      TIT2: ''
    };
    this.tritonSetVolume(Math.abs(this.service.radioConfig.startingVolume)/100);

    if(!this.mobileAndTabletcheck()) {
      if(this.service.radioConfig.autoplay != "false"){
        this.tritonPlay();
      }
    } else {
      this.interface.setCurrentSong(this.tritonCurrentSong);
      this.interface.controlPause();
    }

    if(this.service.radioConfig.autoplay == "false"){
      setInterval(() => this.tritonGetSongList(), 20000);
    }
  }

  tritonGetSongList() {
    this.player.NowPlayingApi.load( {
      mount:this.service.radioConfig.streamUrl,
      hd:true,
      numberToFetch:5,
      eventType:'track'
    } );
  }

  tritonPlay() {
    if(this.tritonCurrentSong.TPE1 !== "") {
      this.interface.setCurrentSong(this.tritonCurrentSong);
    }
    if (this.service.radioConfig.ajax == "false") {
      this.player.setVolume(0);
    }
    this.player.play( {mount: this.service.radioConfig.streamUrl} );
    this.interface.controlPlay();
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
    if(e && e.data && e.data.list) {
      if(e.data.list.length > 0) {
        let cuePoint = {
          data: {
            cuePoint: e.data.list[e.data.list.length - 1]
          }
        };
        this.onTrackCuePoint(cuePoint);
      }
    }
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
