// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/asyncFunctions.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dashboardAsyncFunctions = exports.asyncFunctions = void 0;
const asyncFunctions = {
  getData: async function getData(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      return err.message;
    }
  },
  postPersonData: async function postPersonData(url, dataObject) {
    try {
      console.log(JSON.stringify(dataObject));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            first_name: dataObject.first_name,
            last_name: dataObject.last_name,
            email: dataObject.email,
            country: dataObject.country,
            activities: dataObject.activities
          }
        })
      });
      return response.json();
    } catch (err) {
      return err.message;
    }
  },
  deletePersonData: async function deletePersonData(id) {
    try {
      const res = await fetch("http://18.193.250.181:1337/api/people/".concat(id), {
        method: "DELETE"
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return err.message;
    }
  }
};
exports.asyncFunctions = asyncFunctions;
const dashboardAsyncFunctions = {
  getAllPeopleFromDB: async function getAllPeopleFromDB() {
    try {
      const data = await asyncFunctions.getData("http://18.193.250.181:1337/api/people?&pagination[pageSize]=100&populate=*");
      let array = [];

      for (let page = 1; array.length < data.meta.pagination.total; page++) {
        const data = await asyncFunctions.getData("http://18.193.250.181:1337/api/people?&pagination[pageSize]=100&pagination[page]=".concat(page, "&populate=*"));
        data.data.forEach(el => array.push(el));
      }

      return array;
    } catch (err) {
      alert(err.message);
    }
  },
  updateUncapitalizedNames: async function updateUncapitalizedNames() {
    let array = await dashboardAsyncFunctions.getAllPeopleFromDB();
    array = array.map(el => [el.attributes.first_name, el.attributes.last_name]);
    array = array.filter(el => el[0][0] !== el[0][0].toUpperCase() || el[1][0] !== el[1][0].toUpperCase());
    document.querySelector(".not-capitalized-names").textContent = array.length;
  },
  updateSignupCountries: async function updateSignupCountries() {
    let array = await dashboardAsyncFunctions.getAllPeopleFromDB();
    let uniqueCountries = [];
    array.forEach(el => {
      const shortcut = el.attributes.country.data;

      if (shortcut) {
        if (!uniqueCountries.includes(shortcut.attributes.country)) {
          uniqueCountries.push(shortcut.attributes.country);
        }
      }
    });
    document.querySelector(".signup-countries").textContent = uniqueCountries.length;
  },
  updateTotalSignups: async function updateTotalSignups() {
    try {
      let signups = document.querySelector(".signups");
      const data = await asyncFunctions.getData("http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=country");
      signups.textContent = data.meta.pagination.total;
    } catch (err) {
      alert(err.message);
    }
  },
  fillSelectCountryElem: async function fillSelectCountryElem(selectElem) {
    let options = "";
    const countries = await asyncFunctions.getData("http://18.193.250.181:1337/api/countries");

    if (countries.error) {
      alert("Error ".concat(countries.error.status, ": ").concat(countries.error.message, ". Couldn't load countries"));
    } else if (countries.data.length < 1) {
      alert("Empty array, no country data found.");
    } else {
      countries.data.forEach(el => {
        options += "<option data-id =".concat(el.id, " value=").concat(el.attributes.country, ">").concat(el.attributes.country, "</option>");
      });
    }

    selectElem.innerHTML = '<option data-id ="" value="All countries">All countries</option>' + options;
  }
};
exports.dashboardAsyncFunctions = dashboardAsyncFunctions;
},{}],"js/localStorageFunctions.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.localStorageFunctions = void 0;
const localStorageFunctions = {
  removeLocalStorageCheckboxes() {
    if (localStorage.getItem("activitiesAfterWork")) {
      localStorage.removeItem("activitiesAfterWork");
    }
  },

  setLocalStorageCheckboxes() {
    const activityIds = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map(el => el.dataset.id);
    localStorage.setItem("activitiesAfterWork", JSON.stringify(activityIds));
  },

  getLocalStorageCheckboxes() {
    if (localStorage.getItem("activitiesAfterWork")) {
      return JSON.parse(localStorage.getItem("activitiesAfterWork"));
    }
  }

};
exports.localStorageFunctions = localStorageFunctions;
},{}],"js/formStepsHtml.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSteps = getSteps;

var _asyncFunctions = require("./asyncFunctions");

let step1 = "";
let step2 = "";
let step3 = ""; //initialize, to later return with all step values

let steps = "";
const step4 = "<fieldset>\n<p>Please check your email</p>\n<span\n  >We sent you an email with all of the required information to complete\n  the registration.</span\n>\n</fieldset>";

async function getSteps() {
  let countryOptions = "";
  let countrySelect = "";
  let activityCheckboxes = "";

  try {
    //Getting activities and handling their errors
    const activities = await _asyncFunctions.asyncFunctions.getData("http://18.193.250.181:1337/api/activities");

    if (activities.error) {
      step1 = "Error ".concat(activities.error.status, ": ").concat(activities.error.message);
    } else if (activities.data.length < 1) {
      step1 = "Empty array, no data found.";
    } else {
      //build up step 1 in the form
      activities.data.forEach(el => {
        activityCheckboxes += "<input\n      type=\"checkbox\"\n      name=\"afterwork-activity\"\n      value=\"".concat(el.attributes.title, "\"\n      data-id=\"").concat(el.id, "\"\n    /><label for=\"").concat(el.id, "\">").concat(el.attributes.title, "</label>\n    <br />");
      });
      step1 = "<fieldset>\n<p>What do you usually do After Work?</p>\n".concat(activityCheckboxes, "\n</fieldset>");
    } //Getting countries and handling their errors


    const countries = await _asyncFunctions.asyncFunctions.getData("http://18.193.250.181:1337/api/countries");

    if (countries.error) {
      step2 = "Error ".concat(countries.error.status, ": ").concat(countries.error.message);
    } else if (countries.data.length < 1) {
      step2 = "Empty array, no data found.";
    } else {
      countries.data.forEach(el => {
        countryOptions += "<option data-id =".concat(el.id, " value=").concat(el.attributes.country, ">").concat(el.attributes.country, "</option>");
      }); //build up step 2 in the form

      countrySelect = "<select id=\"country\" name=\"country\">\n    <option selected disabled hidden value=\"1\">Your Country:</option>\n    ".concat(countryOptions, "\n    </select>");
      step2 = "<fieldset>\n<p>Please fill in your details:</p>\n<input type=\"text\" name=\"\" id=\"name\" placeholder=\"First Name\" required/><br />\n<input type=\"text\" name=\"\" id=\"lastName\" placeholder=\"Last Name\" required/><br />\n<input type=\"email\" name=\"\" id=\"email\" placeholder=\"Your Email\" required/><br />\n".concat(countrySelect, "<br />\n<input type=\"checkbox\" name=\"\" id=\"T&C\" required/><span\n  >Please accept our <a href=\"#\">terms and conditions</a></span\n>\n</fieldset>");
    }

    return steps = [step1, step2, step3, step4];
  } catch (err) {
    return steps = [step1, step2, step3, step4];
  }
}
},{"./asyncFunctions":"js/asyncFunctions.js"}],"js/index.js":[function(require,module,exports) {
"use strict";

var _asyncFunctions = require("./asyncFunctions");

var _localStorageFunctions = require("./localStorageFunctions");

var _formStepsHtml = require("./formStepsHtml");

let formSteps = "";
(0, _formStepsHtml.getSteps)().then(data => {
  formSteps = data;
  updateForm();
}).catch(err => alert(err.message + " couldn't load steps"));
const form = document.forms[0];
let currentStep = 0;
const questionCount = document.querySelector(".question-count"); //we're going to change what's inside this container

const formElemWrap = document.querySelector(".form-elements-wrap"); //everytime we click the next button the form updates

form.addEventListener("submit", ev => {
  ev.preventDefault();
  updateForm();
});

function updateForm() {
  function update() {
    formElemWrap.innerHTML = formSteps[currentStep];
    questionCount.textContent = "".concat(currentStep + 1, "/5");

    if (formSteps[currentStep].includes("Error") || formSteps[currentStep].includes("Empty")) {
      document.querySelector("button[type='submit']").remove();
    } else {
      currentStep++;
    }
  } //depending on the form step we tell the form what to do


  switch (currentStep + 1) {
    case 1:
      _localStorageFunctions.localStorageFunctions.removeLocalStorageCheckboxes();

      update();
      break;

    case 2:
      _localStorageFunctions.localStorageFunctions.setLocalStorageCheckboxes();

      update();
      break;

    case 3:
      document.querySelector("button[type='submit']").textContent = "I confirm the details are accurate";
      let btn = document.createElement("button");
      btn.textContent = "Oops, no";
      btn.classList.add("oops-btn");
      const dataToPost = {
        first_name: form.elements[1].value,
        last_name: form.elements[2].value,
        email: form.elements[3].value,
        country: form.elements[4].options[form.elements[4].selectedIndex].dataset.id,
        activities: _localStorageFunctions.localStorageFunctions.getLocalStorageCheckboxes()
      };
      let personID = 0;

      _asyncFunctions.asyncFunctions.postPersonData("http://18.193.250.181:1337/api/people", dataToPost).then(data => {
        personID = data.data.id;
        fetchPersonData(data.data.id);
      }).catch(err => alert(err));

      btn.addEventListener("click", ev => {
        _localStorageFunctions.localStorageFunctions.removeLocalStorageCheckboxes();

        _asyncFunctions.asyncFunctions.deletePersonData(personID);

        ev.currentTarget.remove();
        currentStep = 0;
        update();
        document.querySelector("button[type='submit']").textContent = "Next";
      });
      form.append(btn);
      questionCount.textContent = "".concat(currentStep + 1, "/5");
      currentStep++;
      break;

    case 4:
      if (document.querySelector(".oops-btn")) {
        document.querySelector(".oops-btn").remove();
      }

      document.querySelector("button[type='submit']").remove();
      update();
      break;

    default:
  }
} //for the third step in the form we get the person's data which we have just submitted


async function fetchPersonData(id) {
  let step3 = "";
  const personData = await _asyncFunctions.asyncFunctions.getData("http://18.193.250.181:1337/api/people?&filters[id]=".concat(id));

  if (personData.error) {
    step3 = "Error ".concat(personData.error.status, ": ").concat(personData.error.message);
  } else if (personData.data.length < 1) {
    step3 = "Empty array, no data found.";
  } else {
    const person = personData.data[0].attributes;
    step3 = "<fieldset>\n<p>Are these details correct?</p>\n<span>Please make sure these details are correct:</span>\n<table>\n  <tr>\n    <td>Name</td>\n    <td>".concat(person.first_name, "</td>\n  </tr>\n  <tr>\n    <td>Last Name</td>\n    <td>").concat(person.last_name, "</td>\n  </tr>\n  <tr>\n    <td>email</td>\n    <td>").concat(person.email, "</td>\n  </tr>\n</table>\n</fieldset>");
  }

  formElemWrap.innerHTML = step3;
}
},{"./asyncFunctions":"js/asyncFunctions.js","./localStorageFunctions":"js/localStorageFunctions.js","./formStepsHtml":"js/formStepsHtml.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60312" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/index.js"], null)
//# sourceMappingURL=/js.00a46daa.js.map