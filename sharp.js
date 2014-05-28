/*global document, Image, window, setInterval, requestAnimationFrame*/
var Sharp = {
    version: '0.1'
};

Sharp.Game = function (canvasId) {
    Sharp.canvas = document.getElementById(canvasId);
    Sharp.canvas.width = 1024;
    Sharp.canvas.height = 768;
    Sharp.context = Sharp.canvas.getContext('2d');

    // Scene 초기화
    Sharp.Scene();

    for (var i = 0; i < Sharp.Input.KeyStatus.length; i++) {
        Sharp.Input.KeyStatus[i] = Sharp.Input.KeyState.KEY_NONE;
    }

    requestAnimationFrame(this.Update.bind(this));
};

Sharp.Game.prototype.Update = function () {
    for (var i = 0; i < Sharp.Scene.Sprite.length; i++) {
        // Scene에서 Update 함수가 구현되어 있으면 함수를 호출한다.
        if (Sharp.Scene.Sprite[i].Update !== undefined) {
            Sharp.Scene.Sprite[i].Update();
        }
    }
    requestAnimationFrame(this.Update.bind(this));

    // 업데이트할 때마다 배경을 흰 색으로 채워준다.
    Sharp.context.fillStyle = '#fff';
    Sharp.context.fillRect(0, 0, Sharp.canvas.width, Sharp.canvas.height);

    if (this.Render !== undefined) {
        this.Render();
    }
};

// 자동으로 Update할 Scene들을 집어넣는 곳들이다. 
Sharp.Scene = function () {
    Sharp.Scene.Sprite = [];
};

Sharp.Scene.PushScene = function (Scene) {
    Sharp.Scene.Sprite.push(Scene);
};

Sharp.Scene.PopScene = function (Scene) {
    if (Sharp.Scene.indexOf(Scene) != -1) {
        Sharp.Scene = Sharp.Scene.remove(Scene).bind(this);
    }
};

Sharp.Scene.remove = function () {
    var what, a = Sharp.Scene, L = a.length, ax;
    while (L > 1 && Sharp.Scene.length) {
        what = a[--L];
        while ((ax = Sharp.Scene.indexOf(what)) !== -1) {
            Sharp.Scene.splice(ax, 1);
        }
    }
};

Sharp.DrawImage = function (Scene) {
    Sharp.context.drawImage(
        Scene.sprite, Scene.Pos.x, Scene.Pos.y);
};

Sharp.Sprite = function (src) {
    this.sprite = new Image();
    this.sprite.src = src;

    this.Pos = new Sharp.Point(0, 0);
};

Object.defineProperties(Sharp.Sprite.prototype, {
    'width': {
        'get': function () {
            return this.sprite.width;
        },
        'set': function () { }
    },
    'height': {
        'get': function () {
            return this.sprite.height;
        },
        'set': function () { }
    }
});

Sharp.Point = function (x, y) {
    this.x = x;
    this.y = y;
};

Sharp.Point.prototype.AddPos = function (x, y) {
    this.x += x;
    this.y += y;
};

Sharp.Input = function () { };

Sharp.Input.GetKey = function (Key) {
    return Sharp.Input.KeyStatus[Sharp.Input.Keyboard[Key]];
};

Sharp.Input.KeyStatus = new Array(255);

Sharp.Input.KeyState = {
    KEY_NONE: 0,
    KEY_DOWN: 1
};

Sharp.Input.onKeyDown = function (e) {
    Sharp.Input.KeyStatus[e.keyCode] = Sharp.Input.KeyState.KEY_DOWN;
};

Sharp.Input.onKeyUp = function (e) {
    Sharp.Input.KeyStatus[e.keyCode] = Sharp.Input.KeyState.KEY_NONE;
};

Sharp.Input.Keyboard = {
    A: 'A'.charCodeAt(0),
    B: 'B'.charCodeAt(0),
    C: 'C'.charCodeAt(0),
    D: 'D'.charCodeAt(0),
    E: 'E'.charCodeAt(0),
    F: 'F'.charCodeAt(0),
    G: 'G'.charCodeAt(0),
    H: 'H'.charCodeAt(0),
    I: 'I'.charCodeAt(0),
    J: 'J'.charCodeAt(0),
    K: 'K'.charCodeAt(0),
    L: 'L'.charCodeAt(0),
    M: 'M'.charCodeAt(0),
    N: 'N'.charCodeAt(0),
    O: 'O'.charCodeAt(0),
    P: 'P'.charCodeAt(0),
    Q: 'Q'.charCodeAt(0),
    R: 'R'.charCodeAt(0),
    S: 'S'.charCodeAt(0),
    T: 'T'.charCodeAt(0),
    U: 'U'.charCodeAt(0),
    V: 'V'.charCodeAt(0),
    W: 'W'.charCodeAt(0),
    X: 'X'.charCodeAt(0),
    Y: 'Y'.charCodeAt(0),
    Z: 'Z'.charCodeAt(0),
    BACKSPACE: 8,
    TAP: 9,
    ENTER: 13,
    COMMAND: 15,
    SHIFT: 16,
    CONTROL: 17,
    ALTERNATE: 18,
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    NUMBER_1: 49,
    NUMBER_2: 50,
    NUMBER_3: 51,
    NUMBER_4: 52,
    NUMBER_5: 53,
    NUMBER_6: 54,
    NUMBER_7: 55,
    NUMBER_8: 56,
    NUMBER_9: 57,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_ADD: 107,
    NUMPAD_ENTER: 108,
    NUMPAD_SUBTRACT: 109,
    NUMPAD_DEMICAL: 110,
    NUMPAD_DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    SEMICOLON: 186,
    EQUAL: 187,
    COMMA: 188,
    MINUS: 189,
    PERIOD: 190,
    SLASH: 191,
    BACKQUOTE: 192,
    LEFTBRACKET: 219,
    BACKSLASH: 220,
    RIGHTBRACKET: 221,
    QUOTE: 222
};

window.addEventListener('keydown', Sharp.Input.onKeyDown, false);
window.addEventListener('keyup', Sharp.Input.onKeyUp, false);
