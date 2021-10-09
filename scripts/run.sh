#!/bin/bash
CONF=$(pass backupVerify/prod | ~/.config/b58)
ssh nas bash -s << EOFF
# nohup echo '$CONF' | node ~/backupVerify.js > /dev/null 2>&1 &
#nohup echo '$CONF' | node ~/backupVerify.js > ~/backupVerify.log 2>&1 &
# tmux new-session -d "echo '$CONF' | tr --delete "'"| node ~/backupVerify.js"
tmux new-session -d "bash ls && sleep 30"
EOFF


