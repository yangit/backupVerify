#!/bin/bash
CONF=$(pass backupVerify/prod | tr --delete '\n')
ssh nas bash -s << EOFF
# nohup echo '$CONF' | node ~/backupVerify.js > /dev/null 2>&1 &
nohup echo '$CONF' | node ~/backupVerify.js > ~/backupVerify.log 2>&1 &
# tmux new-session -d "echo '$CONF' | tr --delete "'"| node ~/backupVerify.js"
# tmux new-session -d "echo '$CONF' | node ~/backupVerify.js"
EOFF


