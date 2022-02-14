#!/bin/bash

# One of JSDOM's dependencies, contextify, cannot be checked in because it installs differently depending on the OS.
# This script checks for the presence of JSDOM and installs it if it's missing
# this line searches npm's local repository for jsdom
# 2> /dev/null is becuse NPM likes to complain about missing readme files in third-party packages
# tr removes the blank line that npm puts out if jsdom isn't found

LS_RESULTS=$(npm --parseable ls jsdom 2>/dev/null | tr -d '\n\')

if [[ -n $LS_RESULTS ]]; then     # -n tests to see if the argument is non empty
    echo "jsdom is already installed, skipping"
else
    npm install jsdom
fi