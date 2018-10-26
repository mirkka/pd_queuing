#!/bin/bash

# dependencies
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install --yes nodejs build-essential gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# clone
git clone https://github.com/mirkka/pd_queuing.git

# change ownership of the directory to user ubuntu
chown -R ubuntu:ubuntu /pd_queuing

# move cloned repo to ubuntu user home folder
mv /pd_queuing /home/ubuntu/

# runn npm as user ubuntu, in a specific directory
sudo -H -u ubuntu bash -c '/usr/bin/npm --prefix /home/ubuntu/pd_queuing install /home/ubuntu/pd_queuing'

# add cron job as ubuntu user and output into log
echo "*/10 * * * * node /home/ubuntu/pd_queuing/main.js -p <password> -c '{ \"accessKeyId\": <accessKeyId>, \"secretAccessKey\": <secretAccessKey>, \"region\": <region> }' >> /home/ubuntu/log.log" | crontab -u ubuntu -
