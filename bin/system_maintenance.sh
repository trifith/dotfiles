#!/usr/bin/env bash


# [Arch wiki](https://wiki.archlinux.org/title/System_maintenance)
# [Remove orphaned packages](https://www.cyberciti.biz/faq/delete-remove-orphaned-unused-packages-arch-linux-pacman-command/)

# Check informant for arch news
echo "News from informant on the Arch homepage"
sudo informant check
read -p "Press enter to continue, ctrl-C to abort"
# Error checking
echo "Check for failed systemd services that may need attention."
systemctl --failed
read -p "Press enter to continue, ctrl-C to abort"
echo "Check for other errors logged by the system."
journalctl -p err -b 
read -p "Press enter to continue, ctrl-C to abort"
# Backups
## Packages
echo "Adding explicitly installed package list to ~/.config/pacman/explicit_packages"
pacman -Qeq > $HOME/.config/pacman/explicit_packages 
## Config files
echo "Commit config file changes to upstream git repo"
/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME diff
read -p "Press enter to continue, ctrl-C to abort"
/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME add -u
/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME commit -m "System Maintenance Commit"
/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME push
# Upgrade
echo "Upgrade all packages."
yay -Syu # inclues aur packages
echo "Remove orphaned packages"
sudo pacman -Qdtq | sudo pacman -Rsu -
echo "Clean up pacman cache"
sudo paccache -rk3
