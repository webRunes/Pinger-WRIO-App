#!/bin/sh
openssl aes-256-cbc -K $encrypted_8c393341f536_key -iv $encrypted_8c393341f536_iv -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
mv deploy_key ~/.ssh/id_rsa
git config user.email "AlexeyAnshakov@users.noreply.github.com"
git config user.name "Alexey Anshakov"
cd /tmp
git clone https://github.com/webRunes/Pinger-WRIO-App.git
cd Pinger-WRIO-App/
git checkout master
npm version patch -m '%s[ci skip]'
git remote set-url origin git@github.com:webRunes/Pinger-WRIO-App.git
git push origin master
