#!/bin/sh
git clone https://github.com/webRunes/WRIO-InternetOS.git
cd WRIO-InternetOS
git config user.email "AlexeyAnshakov@users.noreply.github.com"
git config user.name "Alexey Anshakov"
git checkout master
npm version patch -m 'Auto rebuild by Pinger-WRIO-App'
git remote set-url origin git@github.com:webRunes/WRIO-InternetOS.git
git push origin master
cd ..
rm -rf WRIO-InternetOS
rm ~/.ssh/id_rsa
