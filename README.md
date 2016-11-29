# Edge Radio Player

## Usage

### To use *Edge Radio Player* using a script tag:

```html
<script src="edge-radio-player-1.0.0.min.js"></script>
<script>
  var radioId = "XXX";
  var playerElement = document.getElementById("playerElement");
  var edgeRadioPlayer = new EdgeRadioPlayer(playerElement, radioId);
</script>
```

### To import *Edge Radio Player* using a module loader:

```javascript
// Using CommonJS
var EdgeRadioPlayer = require('src/edgeRadioPlayer.js')

var radioId = "XXX";
var playerElement = document.getElementById("playerElement");
var player = new EdgeRadioPlayer(playerElement, radioId);

// ES6
import EdgeRadioPlayer from 'src/edgeRadioPlayer.js'

const RADIO_ID = "XXX";
let playerElement = document.getElementById("playerElement");
let player = new EdgeRadioPlayer(playerElement, RADIO_ID);
```

## Configuration

An optional third parameter is available when starting the player.  This should
be an object that can contain the following parameters.

```javascript
{
  // Available options 'fixed' and 'inline'
  // When fixed, radio is positioned at the top of the page even when scrolling.
  // Inline will position player where it is placed in the DOM.
  positioning: 'fixed',
  // Switch this to true if you are providing your own CSS rules.
  disableCss: false
}
```

## Events

```javascript
player.events.subscribe('play');
```