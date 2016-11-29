'use strict';

// Class to control player
export default class PlayerInterface {
  constructor(containerElement, service) {
    this.container = containerElement;
    this.service = service;
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
      this.toggleMute();
    });
    this.container.appendChild(this.volumeControl);
  }

  playPause() {
    if(this.player.paused) {
      this.player.play();
      this.playPauseControl.classList.remove('paused');
    } else {
      this.player.pause();
      this.playPauseControl.classList.add('paused');
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
  volume(playbackVolume) {
    this.player.volume(playbackVolume);
  };

  createDisplay() {
    this.display = document.createElement('div');
    this.display.id = 'edge-radio-player-display';
    this.container.appendChild(this.display);

    let displayLabel = document.createElement('span');
    displayLabel.id = 'edge-radio-player-display-label';
    displayLabel.innerHTML = 'Live Radio: ';
    this.display.appendChild(displayLabel);

    this.displaySong = document.createElement('span');
    this.displaySong.id = 'edge-radio-player-display-song';
    this.displaySong.innerHTML = 'loading...';
    this.display.appendChild(this.displaySong);

    let imageContainer = document.createElement('div');
    imageContainer.id = 'edge-radio-player-logo-image-container';
    this.container.appendChild(imageContainer);

    this.displayLogo = document.createElement('img');
    this.displayLogo.id = 'edge-radio-player-logo-image';
    this.displayLogo.src = this.service.radioConfig.logoUrl;
    imageContainer.appendChild(this.displayLogo);

  }

  setCurrentSong(currentSong) {
    this.displaySong.innerHTML = currentSong.TIT2 + ' - ' + currentSong.TPE1;
  }
};

