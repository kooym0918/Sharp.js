var Sharp = {
    version: '0.1'
};

Sharp.init = function (canvasId) {
    Sharp.canvas = document.getElementById(canvasId);
    Sharp.canvas.width = Sharp.canvas.style.width.substring(0, Sharp.canvas.style.width.length - 2);
    Sharp.canvas.height = Sharp.canvas.style.height.substring(0, Sharp.canvas.style.height.length - 2);
    Sharp.context = Sharp.canvas.getContext('2d');

    Sharp.context.textBaseline = 'hanging';

    Sharp.load = {
        'queued': 0,
        'loaded': 0
    };

    Sharp.scene();
    Sharp.input();
    Sharp.FPS();
    Sharp.cameraManager();

    requestAnimationFrame(Sharp.update.bind(this));
};

Sharp.update = function () {
    if (Sharp.load.queued == Sharp.load.loaded) {
        Sharp.FPS.calculate();

        // 전역 Update
        if (Sharp.onUpdate !== undefined) {
            Sharp.onUpdate();
        }

        for (var i = 0; i < Sharp.scene.sprite.length; i++) {
            // 사용자 지정 update 기능
            if (Sharp.scene.sprite[i].onUpdate !== undefined) {
                Sharp.scene.sprite[i].onUpdate();
            }

            // 엔진 자체의 update 기능
            if (Sharp.scene.sprite[i].update !== undefined) {
                Sharp.scene.sprite[i].update();
            }
        }

        // 업데이트할 때마다 배경을 흰 색으로 채워준다.
        Sharp.context.fillStyle = '#ffffff';
        Sharp.context.fillRect(0, 0, Sharp.canvas.width, Sharp.canvas.height);

        Sharp.cameraManager.update();

        if (Sharp.onRender !== undefined) {
            Sharp.onRender();
        }
    } else {
        Sharp.context.fillStyle = '#ffffff';
        Sharp.context.fillRect(0, 0, Sharp.canvas.width, Sharp.canvas.height);

        var loadingText = new Sharp.font('16px 맑은 고딕', '로드 중입니다. 잠시만 기다려주세요. ' + Math.round(Sharp.load.loaded / Sharp.load.queued * 100) + '% 완료됨', new Sharp.point(20, 20), '#000000');
        loadingText.render();
    }
    requestAnimationFrame(Sharp.update.bind(this));
};

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

Sharp.cameraManager = function (target, size) {
    Sharp.camera = {
        'target': target,
        'size': size,
        'state': false,
        'pos': new Sharp.point(0, 0)
    };

    if (target) {
        Sharp.camera.state = true;
    }
};
Sharp.cameraManager.update = function () {
    if (Sharp.camera.state === true) {
        try {
            var before = new Sharp.point(Sharp.camera.pos.x, Sharp.camera.pos.y),
                temp = new Sharp.point(
                        Sharp.camera.target.pos.x + Sharp.camera.target.width / 2 - Sharp.canvas.width / 2,
                        Sharp.camera.target.pos.y + Sharp.camera.target.height / 2 - Sharp.canvas.height / 2);

            if (temp.x + Sharp.canvas.width > Sharp.camera.size.x) {
                temp.x = Sharp.camera.size.x - Sharp.canvas.width;
            }
            if (temp.x < 0) {
                temp.x = 0;
            }
            if (temp.y + Sharp.canvas.height > Sharp.camera.size.y) {
                temp.y = Sharp.camera.size.y - Sharp.canvas.height;
            }
            if (temp.y < 0) {
                temp.y = 0;
            }

            Sharp.camera.pos.x += Math.floor((temp.x - before.x) * 0.1);
            Sharp.camera.pos.y += Math.floor((temp.y - before.y) * 0.1);
        } catch (e) {
            console.log('Camera Error :: ' + e);
            Sharp.camera.pos.x = 0;
            Sharp.camera.pos.y = 0;
        }
    }
    else {
        Sharp.camera.pos.x = 0;
        Sharp.camera.pos.y = 0;
    }
};

Sharp.sprite = function (src) {
    this.sprite = new Image();
    this.sprite.src = src;
    this.camera = true;
    Sharp.load.queued++;

    this.sprite.addEventListener('load', function () {
        Sharp.load.loaded++;
    });

    this.pos = new Sharp.point(0, 0);
};
Sharp.sprite.prototype.update = function () {
    /* 아무것도 하지 않는다 */
};
Sharp.sprite.prototype.render = function () {
    Sharp.context.save();
    if (this.camera === false) {
        Sharp.context.translate(this.pos.x, this.pos.y);
    }
    else {
        Sharp.context.translate(
            this.pos.x - Sharp.camera.pos.x,
            this.pos.y - Sharp.camera.pos.y);
    }
    Sharp.context.drawImage(this.sprite, 0, 0);
    Sharp.context.restore();
};
Object.defineProperties(Sharp.sprite.prototype, {
    'width': {
        'get': function () { return this.sprite.width; },
        'set': function () { }
    },
    'height': {
        'get': function () { return this.sprite.height; },
        'set': function () { }
    },
    'absolutePosX': {
        'get': function () {
            return this.pos.x - Sharp.camera.pos.x;
        },
        'set': function () { }
    },
    'absolutePosY': {
        'get': function () {
            return this.pos.y - Sharp.camera.pos.y;
        },
        'set': function () { }
    }
});

/*
 * baseline: 이미지들의 크기가 다를 때 어디를 기준으로 출력할 지 정한다.
 * topleft, topright, bottomleft, bottomright 이렇게 네 가지를 입력받는다.
 * 기본값은 topleft이다.
 */
Sharp.animation = function (freq, baseline) {
    this.freq = freq;
    this.sprite = [];
    this.camera = true;
    this.now = 0;
    this.pos = new Sharp.point(0, 0);
    this.size = new Sharp.point(0, 0);

    this.baseline = baseline || 'topleft';

    this.regulator = new Sharp.regulator(freq);
};
Sharp.animation.prototype.push = function (src) {
    var temp = new Image();
    var self = this;
    temp.src = src;
    Sharp.load.queued++;

    temp.addEventListener('load', function () {
        Sharp.load.loaded++;
        if (self.size.x < this.width) {
            self.size.x = this.width;
        }
        if (self.size.y < this.height) {
            self.size.y = this.height;
        }
    });

    this.sprite.push(temp);
};
Sharp.animation.prototype.update = function () {
    if (this.regulator.isReady()) {
        this.now++;
        if (this.now == this.sprite.length) {
            this.now = 0;
        }
    }
};
Sharp.animation.prototype.render = function () {
    Sharp.context.save();
    if (this.camera === false) {
        Sharp.context.translate(this.pos.x, this.pos.y);
    }
    else {
        Sharp.context.translate(
            this.pos.x - Sharp.camera.pos.x,
            this.pos.y - Sharp.camera.pos.y);
    }

    if (this.baseline == 'topleft') {
        Sharp.context.drawImage(this.sprite[this.now], 0, 0);
    }
    else if (this.baseline == 'topright') {
        Sharp.context.drawImage(this.sprite[this.now],
                this.size.x - this.sprite[this.now].width, 0);
    }
    else if (this.baseline == 'bottomleft') {
        Sharp.context.drawImage(this.sprite[this.now],
            0, this.size.y - this.sprite[this.now].height);
    }
    else if (this.baseline == 'bottomright') {
        Sharp.context.drawImage(this.sprite[this.now],
                this.size.x - this.sprite[this.now].width,
                this.size.y - this.sprite[this.now].height);
    }
    Sharp.context.restore();
};
Object.defineProperties(Sharp.animation.prototype, {
    'width': {
        'get': function () {
            return this.size.x;
        },
        'set': function () { }
    },
    'height': {
        'get': function () {
            return this.size.y;
        },
        'set': function () { }
    },
    'absolutePosX': {
        'get': function () {
            return this.pos.x - Sharp.camera.pos.x;
        },
        'set': function () { }
    },
    'absolutePosY': {
        'get': function () {
            return this.pos.y - Sharp.camera.pos.y;
        },
        'set': function () { }
    }
});

Sharp.font = function (style, text, point, color) {
    this.style = style;
    this.text = text;
    this.camera = true;
    this.color = color;

    this.pos = new Sharp.point(point.x, point.y);
};
Sharp.font.prototype.render = function () {
    Sharp.context.save();
    Sharp.context.font = this.style;
    Sharp.context.fillStyle = this.color;
    if (this.camera === false) {
        Sharp.context.translate(this.pos.x, this.pos.y);
    }
    else {
        Sharp.context.translate(
            this.pos.x - Sharp.camera.pos.x,
            this.pos.y - Sharp.camera.pos.y);
    }
    Sharp.context.fillText(this.text, 0, 0);
    Sharp.context.restore();
};

Sharp.point = function (x, y) {
    this.x = x;
    this.y = y;
};

Sharp.FPS = function () {
    Sharp.FPS.FPSRegulator = new Sharp.regulator(1);
    Sharp.FPS.FPS = 0;
    Sharp.FPS.calculatingFPS = 0;
};
Sharp.FPS.calculate = function () {
    if (Sharp.FPS.FPSRegulator.isReady()) {
        Sharp.FPS.FPS = Sharp.FPS.calculatingFPS;
        Sharp.FPS.calculatingFPS = 0;
    }
    else {
        Sharp.FPS.calculatingFPS++;
    }
};

Sharp.regulator = function (freq) {
    this.freq = freq;
    this.lastTime = 0;
};
Sharp.regulator.prototype.isReady = function () {
    if (!this.lastTime) {
        this.lastTime = new Date().getTime();
        return true;
    }
    var delta = (new Date().getTime() - this.lastTime) / 1000;
    if (delta > 1 / this.freq) {
        this.lastTime = new Date().getTime();
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
Sharp.input.onKeyDown = function (e) {
    Sharp.input.keyStatus[e.keyCode] = Sharp.input.keyState.KEY_DOWN;
};
Sharp.input.onKeyUp = function (e) {
    Sharp.input.keyStatus[e.keyCode] = Sharp.input.keyState.KEY_NONE;
};
Sharp.input.keyStatus = new Array(255);
Sharp.input.keyState = { KEY_NONE: 0, KEY_DOWN: 1 };
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
