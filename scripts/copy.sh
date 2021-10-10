#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh nas bash -s << EOFF
tmux new-session -d "echo '$CONF' | node ~/backupVerify/copySnapshots.js | tee ~/backupVerify/copySnapshots.log"
sleep 1
tail -f ~/backupVerify/copySnapshots.log
EOFF


