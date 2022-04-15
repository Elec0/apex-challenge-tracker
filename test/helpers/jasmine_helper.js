var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const initHTML = '<html><head></head><body><div id="content-area"><div id="main-content"></div></body></html>';
const { window } = new JSDOM(initHTML);
const { document } = (new JSDOM(initHTML)).window;

global.document = document;

if(Object.keys(window).length === 0) {
    // this hapens if contextify, one of jsdom's dependencies doesn't install correctly
    // (it installs different code depending on the OS, so it cannot get checked in.);
    throw "jsdom failed to create a usable environment, try uninstalling and reinstalling it";
}

global.window = {};
import 'mock-local-storage';
const localStorageMock = (() => {
    let store = {};
  
    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      removeItem(key) {
        delete store[key];
      },
      clear() {
        store = {};
      }
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
global.document = window.document;

// var R = global.R = require('../../dist/bundle.js');