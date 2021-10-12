#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh nas bash -s << EOFF
tmux new-session -d "bash -c echo '$CONF' | node ~/backupVerify/backupVerify.js 2>&1 | tee ~/backupVerify/backupVerify.log"
sleep 1
tail -f ~/backupVerify/backupVerify.log
EOFF


