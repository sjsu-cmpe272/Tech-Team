#!/bin/bash
# Set up postgres db for local debugging.

# Install postgres
echo
echo Install PostgreSQL
echo

echo Purge and Autoremove first...
sudo apt-get purge postgr*
sudo apt-get autoremove

echo
echo Install Synaptic...
echo

sudo apt-get install synaptic

# Followed these instructions to install Postgress for UBUNTU 14.04
# http://www.postgresql.org/download/linux/ubuntu/
# Created a file:sudo touch /etc/apt/sources.list.d/pgdg.list
# Changed Permission: sudo chmod 777 /etc/apt/sources.list.d/pgdg.list
# Added this line using nano: deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main

echo
echo Import Repository...
echo

wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -

echo
echo Update...
echo

sudo apt-get update

echo
echo Install PostgreSQL...
echo
sudo apt-get install postgresql-9.4

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
