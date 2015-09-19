#!/bin/bash
# Set up postgres db for local debugging.

echo
echo Install PostgreSQL...
echo

sudo apt-get install -y postgresql postgresql-contrib

# Symlink into home.
echo
echo Setting Symlink into HOME...
echo

ln -sf `ls $PWD/.pgpass` -t $HOME
chmod 600 $HOME"/.pgpass"

# Extract variables from the .pgpass file
# stackoverflow.com/a/5257398
echo
echo Extracting Variables from .pgpass...
echo

PGPASS=`cat .pgpass`
TOKS=(${PGPASS//:/ })
PG_HOST=${TOKS[0]}
PG_PORT=${TOKS[1]}
PG_DB=${TOKS[2]}
PG_USER=${TOKS[3]}
PG_PASS=${TOKS[4]}

# Set up the Users and Database
echo
echo Setup User and Database
echo

echo -e "\n\nINPUT THE FOLLOWING PASSWORD TWICE BELOW: "${PG_PASS} ${PG_USER} ${PG_DB}
sudo -u postgres createuser -U postgres -E -P -s $PG_USER
sudo -u postgres createdb -U postgres -O $PG_USER $PG_DB

# Test that it works.
# Note that the symlinking of pgpass into $HOME should pass the password to psql and make these commands work. 
echo "CREATE TABLE phonebook(phone VARCHAR(32), firstname VARCHAR(32), lastname VARCHAR(32), address VARCHAR(64));" | psql -d $PG_DB -U $PG_USER
echo "INSERT INTO phonebook(phone, firstname, lastname, address) VALUES('+1 123 456 7890', 'John', 'Doe', 'North America');" | psql -d $PG_DB -U $PG_USER

# Set up the Users and Database
echo
echo Setup PG and PG-HSTORE and SEQUELIZE
echo

sudo npm install pg --save
sudo npm install pg-hstore --save
sudo npm install sequelize --save