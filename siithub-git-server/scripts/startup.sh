#!/bin/sh

for user_dir in /home/*; do
  user_name=$(basename "$user_dir")
  adduser "$user_name" -D
  echo "$user_name:default1234siithub"|chpasswd
  chown -R "$user_name" "$user_dir/.ssh"
done
for user_dir in /home/*; do
  user_name=$(basename "$user_dir")
  for repo_dir in "$user_dir"/*; do
    if [ -d "$repo_dir" ]; then
      repo_name=$(basename "$repo_dir")
      group_name="$user_name-$repo_name"
      addgroup -S "$group_name"
      addgroup "$user_name" "$group_name"
      chown -R "$user_name":"$group_name" "$repo_dir"
      if [ -e "$repo_dir/public" ]; then
        chmod -R 775 "$repo_dir"
      else
        chmod -R 770 "$repo_dir"
      fi
      while IFS= read -r collaborator; do
        addgroup "$collaborator" "$group_name"
      done < "$repo_dir/collaborators.txt"
      git config --global --add safe.directory "$repo_dir"
    fi
  done
done

echo "export REGION=$REGION" >> "aws-env.sh"
echo "export QUEUE_URL=$QUEUE_URL" >> "aws-env.sh"

sh -c rc-status
rc-service sshd start
node src/index.js
