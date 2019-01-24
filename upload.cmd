@echo Backing up the database
ssh -i "%USERPROFILE%\.ssh\id_rsa" -t kevin@kevinpena.com "cd /var/www/aguasoft && node scripts/backup"

if "%1" == "db" (
rsync -avzr -e "ssh -i \"%USERPROFILE%\.ssh\id_rsa\"" ^
--perms --chmod=775 ^
--include="db.sqlite" ^
--exclude="*" ^
--progress ^
"./" "kevin@kevinpena.com:/var/www/aguasoft/"
) else (
rsync -avzr -e "ssh -i \"%USERPROFILE%\.ssh\id_rsa\"" ^
--perms --chmod=775 ^
--include="/client/" ^
--include="/client/index.html" ^
--include="/client/dist/" ^
--include="/client/dist/**" ^
--include="/server/" ^
--include="/server/dist/" ^
--include="/server/dist/**" ^
--include="/server/src/" ^
--include="/server/src/db/" ^
--include="/server/src/db/migrations/" ^
--include="/server/src/db/migrations/**" ^
--include=".sequelizerc" ^
--include="package.json" ^
--include="yarn.lock" ^
--exclude="*" ^
--progress ^
"./" "kevin@kevinpena.com:/var/www/aguasoft/"
)

@echo Installing packages and running migrations
ssh -i "%USERPROFILE%\.ssh\id_rsa" -t kevin@kevinpena.com "cd /var/www/aguasoft && yarn --production && sequelize db:migrate --env production"
