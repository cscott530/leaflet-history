/**
 * Created by cscott530 on 12/8/13.
 */
(function (window, document) {
    L.ZoomCenter = L.Class.extend({
        initialize: function(zoom, centerPoint) {
            this.zoom = zoom;
            this.centerPoint = centerPoint;
        }
    });
    L.HistoryControl = L.Control.extend({
        map: null,
        _$backButton: null,
        _$forwardButton: null,
        options: {
            position: 'topright',
            maxHistorySize: 10, //set to 0 for unlimited
            maxFutureSize: 10   //set to 0 for unlimited
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);

            this.state.history.maxSize = this.options.maxHistorySize;
            this.state.future.maxSize = this.options.maxFutureSize;
        },
        onAdd: function(map) {
            var _this = this;
            this.map = map;


            //TODO make icon configurable
            var container = L.DomUtil.create('div', 'history-control btn-group');
            var back = L.DomUtil.create('a', 'history-back-button btn btn-default', container);
            this._$backButton = $(back).click(function() {
                _this._invokeBackOrForward('historyback', _this.state.history, _this.state.future);
                return false;
            }).attr('disabled', true);
            L.DomUtil.create('i', 'fa fa-caret-left', back);
            var forward = L.DomUtil.create('a', 'history-forward-button btn btn-default', container);
            this._$forwardButton = $(forward).click(function() {
                _this._invokeBackOrForward('historyforward', _this.state.future, _this.state.history);
                return false;
            }).attr('disabled', true);
            L.DomUtil.create('i', 'fa fa-caret-right', forward);

            this._addMapListeners();

            return container;
        },
        onRemove: function(map) {

        },
        state: {
            ignoringEvents: false,
            history: {
                items: [],
                maxSize: 0
            },
            future: {
                items: [],
                maxSize: 0
            }
        },
        _pop: function(stack) {
            stack = stack.items;
            if($.isArray(stack) && stack.length > 0) {
                return stack.splice(stack.length - 1, 1)[0];
            }
            return undefined;
        },
        _push: function(stack, value) {
            var maxLength = stack.maxSize;
            stack = stack.items;
            if($.isArray(stack)) {
                stack.push(value);
                if(maxLength > 0 && stack.length > maxLength) {
                    stack.splice(0, 1);
                }
            }
        },
        _invokeBackOrForward: function(eventName, stackToPop, stackToPushCurrent) {
            var response = this._popStackAndUseLocation(stackToPop, stackToPushCurrent);
            if(response) {
                map.fire(eventName, response);
                return true;
            }
            return false;
        },
        _popStackAndUseLocation : function(stackToPop, stackToPushCurrent) {
            //check if we can pop
            if($.isArray(stackToPop.items) && stackToPop.items.length > 0) {
                //get most recent
                var previous =  this._pop(stackToPop);
                //save where we currently are in the 'other' stack
                var current = this._buildZoomCenterObjectFromCurrent(this.map);
                this._push(stackToPushCurrent, current);
                this._moveWithoutTriggerEvent(this.map, previous);

                return {
                    previousLocation: previous,
                    newLocation: current
                };
            }
        },
        _buildZoomCenterObjectFromCurrent:function(map) {
            return new L.ZoomCenter(map.getZoom(), map.getCenter());
        },
        _performActionWithoutTriggerEvent: function(action) {
            var ignoring = this.state.ignoringEvents;
            this.state.ignoringEvents = true;
            if($.isFunction(action)) {
                action();
            }
            this.state.ignoringEvents = ignoring;
        },
        _moveWithoutTriggerEvent: function(map, zoomCenter) {
            this._performActionWithoutTriggerEvent(function() {
                map.setView(zoomCenter.centerPoint, zoomCenter.zoom);
            });
        },
        _addMapListeners: function() {
            var _this = this;
            this.map.on('movestart', function(e) {
                if(!_this.state.ignoringEvents) {
                    _this.state.future.items = [];
                    _this._push(_this.state.history, _this._buildZoomCenterObjectFromCurrent(e.target));
                }

                _this._$backButton.attr('disabled', _this.state.history.items.length === 0);
                _this._$forwardButton.attr('disabled', _this.state.future.items.length === 0);
            });
        }
    });
}(this, document));