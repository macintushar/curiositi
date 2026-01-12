#!/bin/sh
git config core.hooksPath git-hooks
echo "Git hooks path set to 'git-hooks' directory."
chmod +x git-hooks/commit-msg
