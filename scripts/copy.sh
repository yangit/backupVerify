#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh nas bash -s << EOFF
tmux new-session -d "bash -c echo '$CONF' | node ~/backupVerify/copySnapshots.js 2>&1 | tee ~/backupVerify/copySnapshots.log"
sleep 1
tail -f ~/backupVerify/copySnapshots.log
EOFF


