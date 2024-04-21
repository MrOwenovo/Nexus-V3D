/* eslint-disable */

/**
 * Generated by Verge3D Puzzles v.4.6.0
 * Tue, 09 Apr 2024 15:48:57 GMT
 * Prefer not editing this file as your changes may get overridden once Puzzles are saved.
 * Check out https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for the information on how to add your own JavaScript to Verge3D apps.
 */
function createPL(v3d = window.v3d) {

// global variables/constants used by puzzles' functions

var LIST_NONE = '<none>';

var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.openedFileMeta = {};
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};
_pGlob.customEvents = new v3d.EventDispatcher();
_pGlob.eventListeners = [];

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster(); // always check visibility

var PL = {};
// backward compatibility
if (v3d[Symbol.toStringTag] !== 'Module') {
    v3d.PL = v3d.puzzles = PL;
}

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    // initSettings puzzle
_initGlob.output.initOptions.fadeAnnotations = true;
_initGlob.output.initOptions.useBkgTransp = false;
_initGlob.output.initOptions.preserveDrawBuf = false;
_initGlob.output.initOptions.useCompAssets = true;
_initGlob.output.initOptions.useFullscreen = true;

    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}



var pricelist, recliner_unfolded;

// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return obj.type !== 'AmbientLight' &&
           obj.name !== '' &&
           !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
           !obj.isAuxClippingMesh;
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = _pGlob !== undefined;
    objFound = runTime ? _pGlob.objCache[objName] : null;

    if (objFound && objFound.name === objName)
        return objFound;

    if (appInstance.scene) {
        appInstance.scene.traverse(function(obj) {
            if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
                objFound = obj;
                if (runTime) {
                    _pGlob.objCache[objName] = objFound;
                }
            }
        });
    }
    return objFound;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc.filter(function(name) {
        return name;
    });
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}

// assignMaterial puzzle
function assignMat(objSelector, matName) {
    var objNames = retrieveObjectNames(objSelector);
    if (!matName)
        return;
    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat)
        return;
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (obj) {
            var firstSubmesh = obj.resolveMultiMaterial()[0];
            firstSubmesh.material = mat;
        }
    }
}

// utility functions envoked by the HTML puzzles
function getElements(ids, isParent) {
    var elems = [];
    if (Array.isArray(ids) && ids[0] != 'CONTAINER' && ids[0] != 'WINDOW' &&
        ids[0] != 'DOCUMENT' && ids[0] != 'BODY' && ids[0] != 'QUERYSELECTOR') {
        for (var i = 0; i < ids.length; i++)
            elems.push(getElement(ids[i], isParent));
    } else {
        elems.push(getElement(ids, isParent));
    }
    return elems;
}

function getElement(id, isParent) {
    var elem;
    if (Array.isArray(id) && id[0] == 'CONTAINER') {
        if (appInstance !== null) {
            elem = appInstance.container;
        } else if (typeof _initGlob !== 'undefined') {
            // if we are on the initialization stage, we still can have access
            // to the container element
            var id = _initGlob.container;
            if (isParent) {
                elem = parent.document.getElementById(id);
            } else {
                elem = document.getElementById(id);
            }
        }
    } else if (Array.isArray(id) && id[0] == 'WINDOW') {
        if (isParent)
            elem = parent;
        else
            elem = window;
    } else if (Array.isArray(id) && id[0] == 'DOCUMENT') {
        if (isParent)
            elem = parent.document;
        else
            elem = document;
    } else if (Array.isArray(id) && id[0] == 'BODY') {
        if (isParent)
            elem = parent.document.body;
        else
            elem = document.body;
    } else if (Array.isArray(id) && id[0] == 'QUERYSELECTOR') {
        if (isParent)
            elem = parent.document.querySelector(id);
        else
            elem = document.querySelector(id);
    } else {
        if (isParent)
            elem = parent.document.getElementById(id);
        else
            elem = document.getElementById(id);
    }
    return elem;
}

function _checkListenersSame(target0, type0, listener0, optionsOrUseCapture0,
        target1, type1, listener1, optionsOrUseCapture1) {
    const capture0 = Boolean(optionsOrUseCapture0 instanceof Object
            ? optionsOrUseCapture0.capture : optionsOrUseCapture0);
    const capture1 = Boolean(optionsOrUseCapture1 instanceof Object
            ? optionsOrUseCapture1.capture : optionsOrUseCapture1);
    return target0 === target1 && type0 === type1 && listener0 === listener1
            && capture0 === capture1;
}

/**
 * Add the specified event listener to the specified target. This function also
 * stores listener data for easier disposing.
 */
function bindListener(target, type, listener, optionsOrUseCapture) {
    const alreadyExists = _pGlob.eventListeners.some(elem => {
        return _checkListenersSame(elem.target, elem.type, elem.listener,
                elem.optionsOrUseCapture, target, type, listener,
                optionsOrUseCapture);
    });

    if (!alreadyExists) {
        target.addEventListener(type, listener, optionsOrUseCapture);
        _pGlob.eventListeners.push({ target, type, listener, optionsOrUseCapture });
    }
}

// eventHTMLElem puzzle
function eventHTMLElem(eventType, ids, isParent, callback) {
    var elems = getElements(ids, isParent);
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (!elem)
            continue;

        bindListener(elem, eventType, callback);
    }
}

var parseDataUriRe = /^data:(.+\/.+);base64,(.*)$/;

/**
 * Check if object is a Data URI string
 */
function checkDataUri(obj) {
    // NOTE: checking with parseDataUriRe is slow
    return (typeof obj === 'string' && obj.indexOf('data:') == 0);
}

/**
 * Check if object is a URI to a Blob object
 */
function checkBlobUri(obj) {
    return (typeof obj === 'string' && obj.indexOf('blob:') == 0);
}

/**
 * First we use encodeURIComponent to get percent-encoded UTF-8,
 * then we convert the percent encodings into raw bytes which can be fed into btoa
 * https://bit.ly/3dvpq60
 */
function base64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

/**
 * Going backwards: from bytestream, to percent-encoding, to original string
 * https://bit.ly/3dvpq60
 */
function base64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * Convert object or string to application/json Data URI
 */
function toJSONDataUri(obj, mime='application/json') {
    if (typeof obj !== 'string')
        obj = JSON.stringify(obj);
    return 'data:' + mime + ';base64,' + base64EncodeUnicode(obj);
}

/**
 * Convert object or string to application/json Data URI
 */
function toTextDataUri(obj) {
    if (typeof obj !== 'string')
        obj = JSON.stringify(obj);
    return 'data:text/plain;base64,' + base64EncodeUnicode(obj);
}

/**
 * Extract text data from Data URI
 */
function extractDataUriData(str) {
    var matches = str.match(parseDataUriRe);
    return base64DecodeUnicode(matches[2]);
}

// readCSV puzzle
function readCSV(text, delimit, from) {
    if (checkDataUri(text)) {
        text = extractDataUriData(text);
    }

    return v3d.CSVParser.parse(text,
        {delimiter: delimit, skipinitialrows: from});
}

// loadFile puzzle
_pGlob.loadedFiles = {};

function loadFile(url, callback, caching) {

    const files = _pGlob.loadedFiles;

    if (!url || (typeof url != 'string')) {
        _pGlob.loadedFile = '';
        callback();
    } else if (caching && url in files) {
        _pGlob.loadedFile = files[url];
        callback();
    } else {
        const req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                if (req.getResponseHeader('Content-Type').indexOf('application/json') > -1)
                    _pGlob.loadedFile = JSON.parse(req.responseText);
                else
                    _pGlob.loadedFile = req.responseText;

                if (caching)
                    files[url] = _pGlob.loadedFile;

                callback();
            }
        };
        req.open('GET', url, true);
        req.send();
    }
}

// setHTMLElemStyle puzzle
function setHTMLElemStyle(prop, value, ids, isParent) {
    var elems = getElements(ids, isParent);
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (!elem || !elem.style)
            continue;
        elem.style[prop] = value;
    }
}

/**
 * Get a scene that contains the root of the given action.
 */
function getSceneByAction(action) {
    var root = action.getRoot();
    var scene = root.type == "Scene" ? root : null;
    root.traverseAncestors(function(ancObj) {
        if (ancObj.type == "Scene") {
            scene = ancObj;
        }
    });
    return scene;
}

/**
 * Get the current scene's framerate.
 */
function getSceneAnimFrameRate(scene) {
    if (scene && 'animFrameRate' in scene.userData) {
        return scene.userData.animFrameRate;
    }
    return 24;
}

_pGlob.animMixerCallbacks = [];

var initAnimationMixer = function() {

    function onMixerFinished(e) {
        var cb = _pGlob.animMixerCallbacks;
        var found = [];
        for (var i = 0; i < cb.length; i++) {
            if (cb[i][0] == e.action) {
                cb[i][0] = null; // desactivate
                found.push(cb[i][1]);
            }
        }
        for (var i = 0; i < found.length; i++) {
            found[i]();
        }
    }

    return function initAnimationMixer() {
        if (appInstance.mixer && !appInstance.mixer.hasEventListener('finished', onMixerFinished)) {
            bindListener(appInstance.mixer, 'finished', onMixerFinished);
        }
    };

}();

// animation puzzles
function operateAnimation(operation, animations, from, to, loop, speed, callback, rev) {
    if (!animations)
        return;
    // input can be either single obj or array of objects
    if (typeof animations == "string")
        animations = [animations];

    function processAnimation(animName) {
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (!action)
            return;
        switch (operation) {
        case 'PLAY':
            if (!action.isRunning()) {
                action.reset();
                if (loop && (loop != "AUTO"))
                    action.loop = v3d[loop];
                var scene = getSceneByAction(action);
                var frameRate = getSceneAnimFrameRate(scene);

                action.repetitions = Infinity;

                var timeScale = Math.abs(parseFloat(speed));
                if (rev)
                    timeScale *= -1;

                action.timeScale = timeScale;
                action.timeStart = from !== null ? from/frameRate : 0;
                if (to !== null) {
                    action.getClip().duration = to/frameRate;
                } else {
                    action.getClip().resetDuration();
                }
                action.time = timeScale >= 0 ? action.timeStart : action.getClip().duration;

                action.paused = false;
                action.play();

                // push unique callbacks only
                var callbacks = _pGlob.animMixerCallbacks;
                var found = false;

                for (var j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == action && callbacks[j][1] == callback)
                        found = true;

                if (!found)
                    _pGlob.animMixerCallbacks.push([action, callback]);
            }
            break;
        case 'STOP':
            action.stop();

            // remove callbacks
            var callbacks = _pGlob.animMixerCallbacks;
            for (var j = 0; j < callbacks.length; j++)
                if (callbacks[j][0] == action) {
                    callbacks.splice(j, 1);
                    j--
                }

            break;
        case 'PAUSE':
            action.paused = true;
            break;
        case 'RESUME':
            action.paused = false;
            break;
        case 'SET_FRAME':
            var scene = getSceneByAction(action);
            var frameRate = getSceneAnimFrameRate(scene);
            action.time = from ? from/frameRate : 0;
            action.play();
            action.paused = true;
            break;
        case 'SET_SPEED':
            var timeScale = parseFloat(speed);
            action.timeScale = rev ? -timeScale : timeScale;
            break;
        }
    }

    for (var i = 0; i < animations.length; i++) {
        var animName = animations[i];
        if (animName)
            processAnimation(animName);
    }

    initAnimationMixer();
}

// socialShareLink puzzle
function socialShareLink(media, title, text) {

    function fixedEncodeURIComponent(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }

    switch(media) {
    case 'TWITTER':
        return 'https://twitter.com/intent/tweet?url=' +
            fixedEncodeURIComponent(window.location.href) +
            '&text=' + fixedEncodeURIComponent(title);
    case 'FB':
        return 'http://www.facebook.com/sharer.php?u=' +
            fixedEncodeURIComponent(window.location.href);
    case 'REDDIT':
        return 'https://reddit.com/submit?url=' +
            fixedEncodeURIComponent(window.location.href) +
            '&title=' + fixedEncodeURIComponent(title);
    case 'LINKEDIN':
        return 'https://www.linkedin.com/shareArticle?mini=true&url=' +
            fixedEncodeURIComponent(window.location.href) +
             '&title=' + fixedEncodeURIComponent(title) +
             '&summary=' + fixedEncodeURIComponent(text);
    case 'VK':
        return 'http://vk.com/share.php?url=' +
            fixedEncodeURIComponent(window.location.href) +
            '&title=' + fixedEncodeURIComponent(title) +
            '&comment=' + fixedEncodeURIComponent(text);
    case 'WEIBO':
        return 'http://service.weibo.com/share/share.php?url=' +
            fixedEncodeURIComponent(window.location.href) +
            '&title=' + fixedEncodeURIComponent(title);
    }
}

// openWebPage puzzle
function openWebPage(url, mode) {

    if (appInstance && appInstance.controls) {
        appInstance.controls.forceMouseUp();
    }

    if (mode == "NEW") {
        window.open(url);
    } else if (mode == "NO_RELOAD") {
        history.pushState('verge3d state', 'verge3d page', url);
    } else {
        var target;
        switch (mode) {
            case "SAME":
                target = "_self";
                break;
            case "TOP":
                target = "_top";
                break;
            case "PARENT":
                target = "_parent";
                break;
        }

        window.open(url, target);

    }
}


eventHTMLElem('click', 'cream', true, function(event) {
  assignMat('一层白棋1-1', '奶油');
});
eventHTMLElem('click', 'marble', true, function(event) {
  assignMat('一层白棋1-1', '大理石');
});
eventHTMLElem('click', 'marble2', true, function(event) {
  assignMat('一层白棋1-1', '大理石.001');
});
eventHTMLElem('click', 'pudding', true, function(event) {
  assignMat('一层白棋1-1', '布丁');
});
eventHTMLElem('click', 'palmoxylon', true, function(event) {
  assignMat('一层白棋1-1', '棕木');
});
eventHTMLElem('click', 'whiteBirch', true, function(event) {
  assignMat('一层白棋1-1', '白桦木');
});
eventHTMLElem('click', 'limestone', true, function(event) {
  assignMat('一层白棋1-1', '石灰岩');
});
eventHTMLElem('click', 'aluminiumAlloy', true, function(event) {
  assignMat('一层白棋1-1', '铝合金');
});
eventHTMLElem('click', 'Blackstone', true, function(event) {
  assignMat('一层白棋1-1', '黑石');
});
eventHTMLElem('click', 'animatedHologram', true, function(event) {
  assignMat('一层白棋1-1', 'Advanced Animated Hologram');
});
eventHTMLElem('click', 'brownLeather', true, function(event) {
  assignMat('一层白棋1-1', 'Brown leather');
});
eventHTMLElem('click', 'cartoon', true, function(event) {
  assignMat('一层白棋1-1', 'Cartoon shader');
});
eventHTMLElem('click', 'cedar', true, function(event) {
  assignMat('一层白棋1-1', 'Cedar wood knots epoxy');
});
eventHTMLElem('click', 'bubble', true, function(event) {
  assignMat('一层白棋1-1', 'FRC Soap Bubble Material');
});
eventHTMLElem('click', 'glass', true, function(event) {
  assignMat('一层白棋1-1', 'Glass Dispersion');
});
eventHTMLElem('click', 'gold', true, function(event) {
  assignMat('一层白棋1-1', 'Gold');
});
eventHTMLElem('click', 'mayonnaise', true, function(event) {
  assignMat('一层白棋1-1', 'Spicy mayonnaise');
});

loadFile('ar_pricelist.csv', function() {
  pricelist = readCSV(_pGlob.loadedFile, ',', 1);
}, true);
setHTMLElemStyle('visibility', 'hidden', 'fullscreen-button', false);

eventHTMLElem('click', 'change_position_button', true, function(event) {

  operateAnimation('PLAY', '一层白棋1-1', null, null, 'LoopOnce', 1,
          function() {}, false);

      if (recliner_unfolded == 0) {
    setHTMLElemStyle('backgroundImage', 'url("images/fold.png")', 'change_position_button', true);
  } else if (recliner_unfolded == 1) {
    setHTMLElemStyle('backgroundImage', 'url("images/unfold.png")', 'change_position_button', true);
  }
});
eventHTMLElem('click', 'facebook_button', true, function(event) {
  openWebPage(socialShareLink('FB', 'Awesome Recliner', 'This stylish and soft recliner has well padded arms and back cushions. It has been designed and manufactured with the highest standards in mind offering an exceptional strength, durability and paramount comfort.'), 'NEW');
});
eventHTMLElem('click', 'twitter_button', true, function(event) {
  openWebPage(socialShareLink('TWITTER', 'Awesome Recliner', 'This stylish and soft recliner has well padded arms and back cushions. It has been designed and manufactured with the highest standards in mind offering an exceptional strength, durability and paramount comfort.'), 'NEW');
});
eventHTMLElem('click', 'linkedin_button', true, function(event) {
  openWebPage(socialShareLink('LINKEDIN', 'Awesome Recliner', 'This stylish and soft recliner has well padded arms and back cushions. It has been designed and manufactured with the highest standards in mind offering an exceptional strength, durability and paramount comfort.'), 'NEW');
});
eventHTMLElem('click', 'google_button', true, function(event) {
  openWebPage(socialShareLink('GPLUS', 'Awesome Recliner', 'This stylish and soft recliner has well padded arms and back cushions. It has been designed and manufactured with the highest standards in mind offering an exceptional strength, durability and paramount comfort.'), 'NEW');
});



} // end of PL.init function

PL.disposeListeners = function() {
    if (_pGlob) {
        _pGlob.eventListeners.forEach(({ target, type, listener, optionsOrUseCapture }) => {
            target.removeEventListener(type, listener, optionsOrUseCapture);
        });
        _pGlob.eventListeners.length = 0;
    }
}

PL.dispose = function() {
    PL.disposeListeners();
    _pGlob = null;
    // backward compatibility
    if (v3d[Symbol.toStringTag] !== 'Module') {
        delete v3d.PL;
        delete v3d.puzzles;
    }
}



return PL;

}

export { createPL };
