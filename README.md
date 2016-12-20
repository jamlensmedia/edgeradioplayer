# Edge Radio Player

## Usage Example

### To use *Edge Radio Player* using a script tag:

```html
<html>
<head>
  <script src="http://edgeradio.pairserver.com/edge-radio-player-1.0.0.min.js"></script>
</head>
<body>
  <div id="player-element">
  </div>
  <script>
    var radioId = 999;
    var playerElement = document.getElementById("player-element");
    var edgeRadioPlayer = new EdgeRadioPlayer(playerElement, radioId);
  </script>
</body>
</html>
```

## Actions

Play audio file (file location, audio tag)
```javascript
edgeRadioPlayer.playAudio('sample.mp3', 'Sample Audio - Sample')
```

## Events

```javascript
player.events.subscribe('play');
```