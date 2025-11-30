default:
    @just --list

alias hugo := start

start: stop
    @devbox services start >/dev/null 2>&1
    @printf "\n\033[1;32m✓ Hugo server running\033[0m\n"
    @printf "\033[0;36m➜ Local:\033[0m http://localhost:1313/\n"
    @printf "\n\033[0;33mTo stop server, run \n>\033[0m \033[1;36mjust stop\033[0m\n\n"

stop:
    @devbox services stop >/dev/null 2>&1 || true
