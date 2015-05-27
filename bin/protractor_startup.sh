#!/bin/sh

# Startup script for the services needed by the Protractor testing suite.

# Start display manager for browsers.
sudo /usr/bin/Xvfb :10 -ac > /dev/null 2>&1 &

# Start Selenium server
export DISPLAY=:10
/usr/local/bin/webdriver-manager start > /dev/null 2>&1 &

