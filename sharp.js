/*global document, Image, window, setInterval, requestAnimationFrame*/
var Sharp = {
    version: '0.1'
};

Sharp.update = function () {
    Sharp.FPS.calculate();

    for (var i = 0; i < Sharp.scene.sprite.length; i++) {
        // scene에서 update 함수가 구현되어 있으면 함수를 호출한다.
        if (Sharp.scene.sprite[i].update !== undefined) {
            Sharp.scene.sprite[i].update();
        }
    }

    // 업데이트할 때마다 배경을 흰 색으로 채워준다.
    Sharp.context.fillStyle = '#fff';
    Sharp.context.fillRect(0, 0, Sharp.canvas.width, Sharp.canvas.height);

    if (Sharp.render !== undefined) {
        Sharp.render();
    }

    requestAnimationFrame(Sharp.update.bind(this));
};

// 자동으로 update할 scene들을 집어넣는 곳들이다. 
Sharp.scene = function () {
    Sharp.scene.sprite = [];
};

Sharp.scene.push = function (sprite) {
    Sharp.scene.sprite.push(sprite);
};

Sharp.scene.pop = function (sprite) {
    if (Sharp.scene.sprite.indexOf(sprite) != -1) {
        Sharp.scene.remove(sprite);
    }
};

Sharp.scene.remove = function (sprite) {
    for (var i = 0, length = Sharp.scene.sprite.length; i < length; i++) {
        if (Sharp.scene.sprite[i] == sprite) {
            Sharp.scene.sprite.splice(i, 1);
            return;
        }
    }
};

Sharp.drawImage = function (sprite) {
    Sharp.context.save();
    Sharp.context.translate(sprite.Pos.x, sprite.Pos.y);
    Sharp.context.drawImage(sprite.sprite, 0, 0);
    Sharp.context.restore();
};

Sharp.init = function (canvasId) {
    Sharp.canvas = document.getElementById(canvasId);
    Sharp.canvas.width = 1024;
    Sharp.canvas.height = 768;
    Sharp.context = Sharp.canvas.getContext('2d');

    // 초기화가 필요한 객체를 초기화한다.
    Sharp.scene();
    Sharp.input();
    Sharp.FPS();

    requestAnimationFrame(Sharp.update.bind(this));
};

Sharp.sprite = function (src) {
    this.sprite = new Image();
    this.sprite.src = src;

    this.Pos = new Sharp.point(0, 0);
};

Object.defineProperties(Sharp.sprite, {
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

Sharp.point = function (x, y) {
    this.x = x;
    this.y = y;
};

Sharp.point.prototype.AddPos = function (x, y) {
    this.x += x;
    this.y += y;
};

Sharp.FPS = function () {
    Sharp.FPS.LastCalledTime = 0;
    Sharp.FPS.FPS = 0;
};

Sharp.FPS.calculate = function () {
    if (!Sharp.FPS.LastCalledTime) {
        Sharp.FPS.LastCalledTime = new Date().getTime();
        Sharp.FPS.FPS = 0;
        return;
    }
    var Delta = (new Date().getTime() - Sharp.FPS.LastCalledTime) / 1000;
    Sharp.FPS.LastCalledTime = new Date().getTime();
    Sharp.FPS.FPS = 1 / Delta;
};

Sharp.regulator = function (Freq) {
    this.Freq = Freq;
    this.LastTime = 0;
};

Sharp.regulator.prototype.isReady = function () {
    if (!this.LastTime) {
        this.LastTime = new Date().getTime();
        return false;
    }
    var Delta = (new Date().getTime() - this.LastTime) / 1000;
    if (Delta > 1 / this.Freq) {
        this.LastTime = new Date().getTime();
        return true;
    }
    else {
        return false;
    }
};

Sharp.input = function () {
    for (var i = 0; i < this.input.keyStatus.length; i++) {
        this.input.keyStatus[i] = Sharp.input.keyState.KEY_NONE;
    }
};

Sharp.input.getKey = function (key) {
    return Sharp.input.keyStatus[Sharp.input.keyboard[key]];
};

Sharp.input.keyStatus = new Array(255);

Sharp.input.keyState = {
    KEY_NONE: 0,
    KEY_DOWN: 1
};

Sharp.input.onKeyDown = function (e) {
    Sharp.input.keyStatus[e.keyCode] = Sharp.input.keyState.KEY_DOWN;
};

Sharp.input.onKeyUp = function (e) {
    Sharp.input.keyStatus[e.keyCode] = Sharp.input.keyState.KEY_NONE;
};

Sharp.input.keyboard = {
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

window.addEventListener('keydown', Sharp.input.onKeyDown, false);
window.addEventListener('keyup', Sharp.input.onKeyUp, false);
