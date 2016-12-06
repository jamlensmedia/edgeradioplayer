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
  }

  createPlayer() {
    this.player = document.createElement('audio');
    this.container.appendChild(this.player);
    this.container.classList.add('edge-radio-player-container');
  }

  createControls() {
    this.playPauseControl = document.createElement('div');
    this.playPauseControl.id = 'edge-radio-player-play-pause';
    this.playPauseControl.addEventListener('click', () => {
      this.playPause();
    });
    this.container.appendChild(this.playPauseControl);

    this.volumeControl = document.createElement('div');
    this.volumeControl.id = 'edge-radio-player-volume';
    this.volumeControl.addEventListener('click', () => {
      this.toggleVolume();
    });
    this.volumeSliderContainer.addEventListener('click', (event) => {
      this.updateVolume(event);
    });
    this.container.appendChild(this.volumeControl);
  }

  playPause() {
    if(!this.playerController.streamStarted) {
      this.playerController.startStream();
    } else {
      if(this.player.paused) {
        this.player.play();
        this.playPauseControl.classList.remove('paused');
      } else {
        this.player.pause();
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
    this.player.volume = Math.abs(playbackVolume - 100)/100;
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

    this.volumeSliderContainer = document.createElement('div');
    this.volumeSliderContainer.id = 'edge-radio-player-volume-slider-container';
    this.container.appendChild(this.volumeSliderContainer);

    this.volumeSlider = document.createElement('div');
    this.volumeSlider.id = 'edge-radio-player-volume-slider';
    this.volumeSliderContainer.appendChild(this.volumeSlider);
  }

  setDisplayContent(content) {
    this.displaySong.innerHTML = content
  }

  setDisplayLabel(content) {
    this.displayLabel.innerHTML = content;
  }

  setCurrentSong(currentSong) {
    this.setDisplayContent(currentSong.TPE1 + ' - ' + currentSong.TIT2);
  }
};

