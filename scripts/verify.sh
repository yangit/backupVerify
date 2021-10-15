#!/bin/bash
CONF=$(pass 0backup/verify/prod | ~/.config/bin/b58)
ssh backupManager bash -s << EOFF
tmux new-session -d bash -c "cd backupVerify && echo $CONF | node backupVerify.js 2>&1 | tee ~/backupVerify/backupVerify.log"
sleep 1
tail -f ~/backupVerify/backupVerify.log
EOFF


