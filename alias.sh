alias dc='docker compose'
alias dcp='docker compose -f docker-compose.prod.yml'
alias a='docker compose exec server'
alias prod-push='echo aguasoft nginx certbot | xargs -n1 docker-compose -f docker-compose.prod.yml build --push'
