#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh nas bash -s << EOFF
tmux new-session -d "echo '$CONF' | node ~/backupVerify.js | tee ~/backupVerify.log"
sleep 1
tail -f ~/backupVerify.log
EOFF


