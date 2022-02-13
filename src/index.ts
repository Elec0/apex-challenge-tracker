import {storageAvailable} from "./StorageCheck";

window.addEventListener("load", (event) => {
    // document.querySelector("body").innerHTML = "Hi from typescript the fifth"
    // let storage = window.localStorage;
    // Make sure we have the storage we need
    if(!storageAvailable("localStorage")) {

    }

});
