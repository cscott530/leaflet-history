Leaflet-History Control
==

Leaflet-History control is a plugin to [leafletjs](http://leafletjs.com) that enables tracking map movements in a history similar to a web browser. I tried to make this plugin extremely easy to use by default, but also extremely extensible if you have want to modify it.

By default, it is a simple pair of buttons -- back and forward. However, it can be customized to use different icons, different text, allow certain locations to not be saved on move, or even use your own external controls and simply use Leaflet-History as a manager of the history.

Demo
--
TODO

Installation
--
TODO

Usage
--
Import leaflet-history.js and leaflet-history.css in your page.
```html
<link rel="stylesheet" type="text/css" href="leaflet-history.less">
<script type="text/javascript" src="leaflet-history.js"></script>
```
After creating your leaflet map, create and add the controller:

```javascript
new L.HistoryControl({}).addTo(map);
```
Options
--

When you call `new L.HistoryControl()`, you may pass in an options object to extend its functionality. These options are:

* **position** - sets which corner of the map to place your controls. possible values are  `'topleft'` | `'topright'`(default) | `'bottomleft'` | `'bottomright'`
* **maxHistorySize** - the number of moves in the history to save before clearing out the oldest. default value is `10`, use `0` or a negative number to make unlimited.
* **maxFutureSize** - the number of "future" moves to save when navigating back. default value is `0` (unlimited).
  * if this value is less than `maxHistorySize`, you won't be able to return to the most recent state!
* **backImage**, **forwardImage** - the class used for the button images. defaults are `'fa fa-caret-left'` and `'fa fa-caret-right'`, respectively.
  * no image will be displayed if set to empty string.
* **backText**, **forwardText** - the text in the buttons. defaults are `''` (empty).
* **backTooltip**, **forwardTooltip** - tooltip contents. defaults are `'Go to Previous Extent'` and `'Go to Next Extent'`, respectively.
* **backImageBeforeText**, **forwardImageBeforeText** - when both text and image are present, whether to show the image first or the text first (left to right). defaults are `true` and `false`, respectively.
* **orientation** - `'vertical'` | `'horizontal'`(default) - whether to position the buttons on top of one another or side-by-side.
* **useExternalControls** - `true` | `false`(default) - set to true to hide these controls on the map and instead use your own controls. See the [Events](#Events) and API for more details on this.
* **shouldSaveMoveInHistory** - `function(zoomCenter) { return true; }` a callback you can provide that gets called with every move. return `false` to not save a move.
  * useful if you have certain situations where you move the map programmatically and don't want the user to be able to go back.

For example, to set your history control to use bootstrap icons and have text:
```javascript
new L.HistoryControls({
    backText: 'Back',
    backImage: 'glyphicon glyphicon-chevron-left',
    forwardText: 'Forward',
    forwardImage: 'glyphicon glyphicon-chevron-right'
}).addTo(map);
```

Types
--
### L.ZoomCenter
Encapsulates both a zoomlevel and the map's center point. Properties:

* **zoom** - number, value of `map.getZoom()`
* **centerPoint** - `L.LatLng`, value of `map.getCenter()`

API
--
After you have called `new L.HistoryControl()`, you can use these methods to manage it.

* **goBack()** - if able, will go to previous map extent. Pushes current to the "future" stack.
* **goForward()** - if able, will go to next map extent. Pushes current to the "back" stack.
  * If you set `useExternalControls` to `true` when initializing, use `goBack()` and `goForward()`
* **clearHistory()** - resets the stack of history items.
* **clearFuture()** - resets the stack of future items.
* **performActionWithoutTriggeringEvent(callback)** - will set the map to ignore caching on any events that occur during your (synchronous) callback. Useful if you want to set an initial map location after it's already been configured.
* **moveWithoutTriggeringEvent(zoomCenter)** - convenience wrapper to `performActionWithoutTriggeringEvent`. Rather than passing in a callback, give a `L.ZoomCenter` object.

For example, if you want to recenter your map after loading some data, but don't want your original location to be in the history:
```javascript
var history = new L.HistoryControl().addTo(map);
//callbacks to get map data
history.moveWithoutTriggerEvent(new L.ZoomCenter(12, L.LatLng([50.5, 30.5])));
```

Events
--
Leaflet-History uses the leaflet event API, so subscribing is simple: `map.on('historyback', function(location) {});`
### Action Events
* **historyback** - fired when `goBack()` is invoked
* **historyfoward** - fired when `goForward()` is invoked
  * These get fired whether using the API, or if the default buttons are used.

In both cases the parameter is an object:
```
{
    currentLocation: L.ZoomCenter object, //the current map location
    newLocation: L.ZoomCenter             //the new location after the move
}
```

### State Events
* **historybackenabled** - fired when the state of the **back** button changes from disabled to enabled.
* **historybackdisabled** - fired when the state of the **back** button changes from enabled to disabled.
* **historyforwardenabled** - fired when the state of the **forward** button changes from disabled to enabled.
* **historyforwarddisabled** - fired when the state of the **forward** button changes from enabled to disabled.
  * Note that these get fired even if using external controls, as a way to help manage your own buttons' state.
  * `historybackdisabled` and `historyforwarddisabled` are both fired upon initialization.