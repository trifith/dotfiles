export BASH_CONF="bash_profile"
export PATH=/usr/local/bin:~/bin:$PATH
export RAILS_ENV=development
export CORE_HOST=smurphy-mbp.i.sessionm.com
export PATH=/usr/local/sbin:$PATH:
export ADMIN=~/work/greyhound/admin
export ADVERTISER=~/work/greyhound/advertiser
export CMS=~/work/cms-content
export CORE=~/work/greyhound/core
export DEVELOPER=~/work/greyhound/developer
export ONDEMAND=~/work/greyhound/ondemand
export THUNDER=~/work/thunderbirds
export GOPATH=~/work/thunderbirds
export K2=~/work/k2
#export CLASSPATH=~/work/lessons/Classpath:.
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_72.jdk/Contents/Home
export PATH=$PATH:$JAVA_HOME
export HISTSIZE=5000
export HISTFILESIZE=10000
export M3_HOME=/usr/local/Cellar/maven/3.3.9
#export M2_REPO=/usr/local/Cellar/maven/3.3.9
export PATH=$PATH:$:M3_HOME:M3_HOME/bin
export PROMPT_COMMAND="history -a; history -c; history -r; $PROMPT_COMMAND"
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*


export PATH="$PATH:$HOME/.rvm/bin" # Add RVM to PATH for scripting
alias ls="ls -G"
alias grep="grep -n"
alias ssh="ssh -A"
ssh-add 2> /dev/null

function title {
    echo -ne "\033]0;"$*"\007"
}


##
# Your previous /Users/smurphy/.bash_profile file was backed up as /Users/smurphy/.bash_profile.macports-saved_2016-05-12_at_13:40:10
##

# MacPorts Installer addition on 2016-05-12_at_13:40:10: adding an appropriate PATH variable for use with MacPorts.
export PATH="/opt/local/bin:/opt/local/sbin:$PATH"
# Finished adapting your PATH environment variable for use with MacPorts.
# Git branch in prompt.
parse_git_branch() {
        git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
    }
    export PS1="\u@\h \W\[\033[0;95m\]\$(parse_git_branch)\[\033[00m\] $ "
