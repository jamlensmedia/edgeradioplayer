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

    this.playPauseControl = document.createElement('div');
    this.playPauseControl.id = 'edge-radio-player-play-pause';
    this.playPauseControl.addEventListener('click', () => {
      this.playPause();
    });
    this.controlContainer.appendChild(this.playPauseControl);

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

  playPause() {
    if(this.service.radioConfig.type === 'streamOn') {
      if(!this.playerController.streamStarted) {
        this.playerController.startStream();
      } else {
        if(this.player.paused) {
          this.playerController.updateSong();
          this.player.play();
          this.playPauseControl.classList.remove('paused');
        } else {
          this.player.pause();
          this.playPauseControl.classList.add('paused');
          this.playerController.stopStream();
        }
      }
    } else if(this.service.radioConfig.type === 'triton') {
      if(this.playerController.player.MediaElement.isPaused()) {
        this.player.pause();
        this.playerController.player.resume();
        this.playPauseControl.classList.remove('paused');
      } else {
        this.playerController.tritonPause();
        this.playPauseControl.classList.add('paused');
      }
    }
  };

  toggleMute() {
    if(this.player.muted) {
      this.player.muted = false;
      this.volumeControl.classList.remove('muted');
    } else {
      this.player.muted = true;
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
    this.setDisplayLabel('Live Radio: ');
    this.display.appendChild(this.displayLabel);

    this.displaySong = document.createElement('span');
    this.displaySong.id = 'edge-radio-player-display-song';
    this.setDisplayContent('loading...');
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

    imageContainer.appendChild(logoLink);
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
    this.setDisplayContent(currentSong.TPE1 + ' - ' + currentSong.TIT2);
  }
};

