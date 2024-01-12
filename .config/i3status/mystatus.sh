#!/usr/bin/env bash
# This i3status wrapper adds GPU temp information
#
# Requries JQ
#
# Add to i3status config as 
# order += "tztime holder__gpu_temp"
# and
# tztime holder__gpu_temp {
#        format = "holder__gpu_temp"
# }
# 
# Drawn from https://github.com/i3/i3status/blob/main/contrib/any_position_wrapper.sh
#

function update_holder {

  local instance="$1"
  local replacement="$2"
  echo "$json_array" | jq --argjson arg_j "$replacement" "(.[] | (select(.instance==\"$instance\"))) |= \$arg_j"
}

function remove_holder {

  local instance="$1"
  echo "$json_array" | jq "del(.[] | (select(.instance==\"$instance\")))"
}

function gpu_temp {
  local gpu_name=`nvidia-smi --query-gpu=name --format=csv,noheader `
  local gpu_temp=`nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader` 
  local color="#00FF00"
  if [ $gpu_temp -gt 70 ]
  then
    color="#FFFF00"
  fi
  if [ $gpu_temp -gt 90 ]
  then
    color="#FF0000"
  fi
  local text="$gpu_name: $gpu_temp °C"
  local json='{"full_text": "'$text'", "color":"'$color'"}'
  json_array=$(update_holder holder__gpu_temp "$json")
}

i3status --config ~/.config/i3status/i3status.conf | (read line; echo "$line"; read line ; echo "$line" ; read line ; echo "$line" ; while true
do
  read line
  json_array="$(echo $line | sed -e 's/^,//')"
  gpu_temp 
  echo ",$json_array" 
done) 
