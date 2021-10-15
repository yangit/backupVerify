#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh backupManager bash -s << EOFF
tmux new-session -d bash -c "cd backupVerify && echo $CONF | node copySnapshots.js 2>&1 | tee ~/backupVerify/copySnapshots.log"
sleep 1
tail -f ~/backupVerify/copySnapshots.log
EOFF


