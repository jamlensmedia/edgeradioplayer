'use strict';

// Class to control player
export default class PlayerInterface {
  constructor(containerElement, service, player) {
    this.container = containerElement;
    this.service = service;
    this.playerController = player;
    this.createPlayer();
    this.createDisplay();
    this.createControls();
    this.trackAnimating = false;
  }

  createPlayer() {
    this.player = document.createElement('audio');
    this.player.id = 'edge-radio-player-element';
    this.container.appendChild(this.player);
    this.container.id = 'edge-radio-player-container';
    this.container.classList.add('edge-radio-player-container');
    this.container.style.background = this.service.radioConfig.background;
  }

  createControls() {
    this.controlContainer = document.createElement('div');
    this.controlContainer.id = 'edge-radio-player-control-container';
    this.controlContainer.style.background = this.service.radioConfig.background;
    this.container.appendChild(this.controlContainer);

    this.playPauseControl = document.createElement('a');
    this.playPauseControl.id = 'edge-radio-player-play-pause';
    this.playPauseControl.style.background = this.service.radioConfig.radio_toggle_background;

    this.controlContainer.appendChild(this.playPauseControl);

    if (this.service.radioConfig.ajax == "false") {
      this.controlPause();
      this.playPauseControl.href = this.service.radioConfig.liveLink;

      this.volumeControl = document.createElement('a');
      this.volumeControl.target = '_blank';
      this.volumeControl.classList.add('muted');
      this.volumeControl.id = 'edge-radio-player-volume';
      this.volumeControl.addEventListener('click', () => {
        this.toggleMute();

        // this.toggleVolume();
      });
    } else {
      this.playPauseControl.addEventListener('click', () => {
        // set cookie for autoplay, in click event
        if(this.playerController.player.MediaPlayer && !this.playerController.player.MediaPlayer.isPlaying()) {
          this.setCookie('radio_cookie_autoplay', 'true', 2);
        } else {
          this.setCookie('radio_cookie_autoplay', 'false', 2);
        }

        this.playPause();
      });

      this.addVolumeControl();
    }

  }

  addVolumeControl() {
    this.volumeControl = document.createElement('div');
    this.volumeControl.id = 'edge-radio-player-volume';
    this.volumeControl.addEventListener('click', () => {
      this.toggleVolume();
    });
    this.controlContainer.appendChild(this.volumeControl);

    this.volumeSliderContainer = document.createElement('div');
    this.volumeSliderContainer.id = 'edge-radio-player-volume-slider-container';
    this.volumeSliderContainer.style.background = this.service.radioConfig.background;
    this.controlContainer.appendChild(this.volumeSliderContainer);

    this.volumeSlider = document.createElement('div');
    this.volumeSlider.id = 'edge-radio-player-volume-slider';
    this.volumeSliderContainer.appendChild(this.volumeSlider);
    this.volumeSliderContainer.addEventListener('click', (event) => {
      this.updateVolume(event);
    });
    this.volume(Math.abs(this.service.radioConfig.startingVolume - 100));
  }

  controlPlay() {
    this.playPauseControl.innerHTML = 'TURN RADIO OFF';
    this.playPauseControl.style.color = this.service.radioConfig.radio_toggle_off_text_color;
    this.playPauseControl.classList.remove('paused');
  }

  controlPause() {
    this.playPauseControl.innerHTML = 'TURN RADIO ON';
    this.playPauseControl.style.color = this.service.radioConfig.radio_toggle_on_text_color;
    this.playPauseControl.classList.add('paused');
  }

  setCookie(name,value,days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  };


  playPause() {
    if(this.service.radioConfig.type === 'streamOn') {
      if(!this.playerController.streamStarted) {
        this.playerController.startStream();
      } else {
        if(this.player.paused) {
          this.playerController.updateSong();
          this.player.play();
          this.controlPlay();
        } else {
          this.player.pause();
          this.controlPause();
          this.playerController.stopStream();
        }
      }
    } else if(this.service.radioConfig.type === 'triton') {
      if(this.playerController.player.MediaPlayer && !this.playerController.player.MediaPlayer.isPlaying()) {
        this.player.pause();
        this.playerController.tritonPlay();
        if(this.playerController.tritonCurrentSong.TPE1 !== "") {
          this.setCurrentSong(this.playerController.tritonCurrentSong);
        }
        this.controlPlay()
      } else {
        this.playerController.tritonPause();
        this.controlPause()
      }
    }
  };

  toggleMute() {
    if(this.volumeControl.className.indexOf('muted') !== -1) {
      this.volumeControl.classList.remove('muted');
    } else {
      this.volumeControl.classList.add('muted');
    }
  };

  toggleVolume() {
    if(this.volumeSliderOpen) {
      this.volumeSliderOpen = false;
      this.volumeSliderContainer.classList.remove('active');
    } else {
      this.volumeSliderOpen = true;
      this.volumeSliderContainer.classList.add('active');
    }
  };

  updateVolume(event) {
    this.volume(event.offsetY);
  }

  volume(playbackVolume) {
    this.volumeSlider.style.top = playbackVolume + 'px';
    let newVolume = Math.abs(playbackVolume - 100)/100;
    if(this.service.radioConfig.type === 'triton') {
      this.playerController.tritonSetVolume(newVolume);
    }
    this.player.volume = newVolume;
  };

  createDisplay() {
    this.display = document.createElement('div');
    this.display.id = 'edge-radio-player-display';
    this.container.appendChild(this.display);

    this.displayLabel = document.createElement('span');
    this.displayLabel.id = 'edge-radio-player-display-label';
    this.setDisplayLabel(this.service.radioConfig.orangeText + ' ');
    this.display.appendChild(this.displayLabel);

    this.displaySong = document.createElement('span');
    this.displaySong.id = 'edge-radio-player-display-song';
    this.setDisplayContent('Loading...');
    this.display.appendChild(this.displaySong);

    let imageContainer = document.createElement('div');
    imageContainer.id = 'edge-radio-player-logo-image-container';
    this.container.appendChild(imageContainer);

    let logoLink = document.createElement('a');
    logoLink.href = this.service.radioConfig.logoLink;
    logoLink.target = '_blank';

    this.displayLogo = document.createElement('img');
    this.displayLogo.id = 'edge-radio-player-logo-image';
    this.displayLogo.src = this.service.radioConfig.logoImage;
    logoLink.appendChild(this.displayLogo);

    // listen live
    let imageLiveContainer = document.createElement('div');
    imageLiveContainer.id = 'edge-radio-player-live-image-container';
    this.container.appendChild(imageLiveContainer);

    let liveLink = document.createElement('a');
    liveLink.href = this.service.radioConfig.liveLink;
    liveLink.target = '_blank';

    this.displayLive = document.createElement('img');
    this.displayLive.id = 'edge-radio-player-live-image';
    this.displayLive.src = this.service.radioConfig.liveImage;
    liveLink.appendChild(this.displayLive);
    imageLiveContainer.appendChild(liveLink);

    this.displayLabel = document.createElement('a');
    this.displayLabel.href = this.service.radioConfig.whiteTextLink;
    this.displayLabel.id = 'edge-radio-player-display-label-white';
    this.displayLabel.target = '_blank';
    this.setDisplayLabel(this.service.radioConfig.whiteText);
    this.container.appendChild(this.displayLabel);

    if(this.service.radioConfig.dropDownLinks.length !== 0) {
      this.createDropDown();
    }

    imageContainer.appendChild(logoLink);

    if(this.service.radioConfig.adLink && this.service.radioConfig.adImage) {
      this.createAd();
    }
  }

  createDropDown() {
    this.dropDownContainer = document.createElement('ul');
    this.dropDownContainer.id = 'edge-radio-player-link-dropdown';
    this.dropDownContainer.style.background = this.service.radioConfig.background;

    for (var i = 0; i < this.service.radioConfig.dropDownLinks.length; ++i) {
      let dropDownItem = document.createElement('li');
      let dropDownLink = document.createElement('a');

      dropDownLink.href = this.service.radioConfig.dropDownLinks[i].link;
      dropDownLink.target = '_blank';
      dropDownLink.innerHTML = this.service.radioConfig.dropDownLinks[i].label;
      dropDownItem.appendChild(dropDownLink);

      this.dropDownContainer.appendChild(dropDownItem);
    }

    this.displayLabel.addEventListener("mouseover", ( event ) => {
      this.dropDownContainer.classList.add('open');
    }, false);

    this.displayLabel.addEventListener("mouseleave", ( event ) => {
      this.dropDownContainer.classList.remove('open');
    }, false);

    this.dropDownContainer.addEventListener("mouseover", ( event ) => {
      this.dropDownContainer.classList.add('open');
    }, false);

    this.dropDownContainer.addEventListener("mouseleave", ( event ) => {
      this.dropDownContainer.classList.remove('open');
    }, false);

    this.container.appendChild(this.dropDownContainer);
  }

  createAd() {
    let adContainer = document.createElement('div');
    adContainer.id = 'edge-radio-player-ad-container';
    this.container.appendChild(adContainer);

    let adLink = document.createElement('a');
    adLink.href = this.service.radioConfig.adLink;
    adLink.target = '_blank';

    this.displayAd = document.createElement('img');
    this.displayAd.id = 'edge-radio-player-ad';
    this.displayAd.src = this.service.radioConfig.adImage;
    adLink.appendChild(this.displayAd);

    adContainer.appendChild(adLink);
    this.container.appendChild(adContainer);
  }

  setDisplayContent(content) {
    this.displaySong.innerHTML = content;
    if(this.displaySong.offsetWidth > this.display.offsetWidth && !this.trackAnimating) {
      this.trackAnimating = true;
      this.startTrackScroll();
    }
  }

  resetTrackPosition() {
    this.displaySong.style.transform = "translate3d(0, 0, 0)";
    setTimeout(() => {
      this.startTrackScroll();
    }, 5000);
  }

  startTrackScroll() {
    this.displaySong.style.transform = "translate3d(-" + (this.displaySong.offsetWidth - this.display.offsetWidth) + "px, 0, 0)";
    setTimeout(() => {
      this.resetTrackPosition();
    }, 5000);
  }

  setDisplayLabel(content) {
    this.displayLabel.innerHTML = content;
  }

  setCurrentSong(currentSong) {
    let displayContent = currentSong.TPE1;
    if(currentSong.TIT2 !== '') {
      displayContent += ' - ' + currentSong.TIT2;
    }

    this.setDisplayContent(displayContent);
  }
};
