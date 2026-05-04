#!/bin/bash

CYAN="\033[1;36m"
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

clear

echo -e "${CYAN}"
echo "========================================"
echo ""
echo " N E T H O S T       R E P R E S E N T S       H I L O       P A N E L"
echo "         copyright content do not use without credit"
echo ""
echo "========================================"
echo -e "${RESET}"

read -p "Are you at least 13 years old and know setup? (y/n): " age

if [[ "$age" != "y" ]]; then
    echo -e "${RED}Exit...${RESET}"
    exit 1
fi

REPO="https://github.com/RIVEOG/HILOPANEL.git"

DIR=""

install_files() {
    echo -e "${GREEN}Cloning repo...${RESET}"

    git clone $REPO

    # FIX: auto detect folder (no more cd error)
    DIR=$(ls -d */ | grep -i hilopanel | head -n 1)

    if [ -z "$DIR" ]; then
        echo -e "${RED}Repo folder not found!${RESET}"
        exit 1
    fi

    cd "$DIR" || exit

    echo -e "${GREEN}Running install.sh...${RESET}"
    chmod +x install.sh
    bash install.sh

    echo -e "${YELLOW}Starting PM2...${RESET}"

    PORT=${PORT:-3000}

    pm2 start npm --name "HILOPANEL" -- start -- --port $PORT
    pm2 save

    echo -e "${GREEN}Running on port $PORT${RESET}"
    read -p "Press enter..."
}

setup_env() {
    FILE="ENV.json"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}ENV.json not found${RESET}"
        return
    fi

    read -p "Hosting Name (Hilos): " pname
    read -p "Hosting Tag (Premium game & app hosting): " ptag

    read -p "Install admin? (y/n): " admin

    if [[ "$admin" == "y" ]]; then
        read -p "Email: " aemail
        read -p "Username: " auser
        read -p "Password: " apass
    fi

    read -p "Pterodactyl setup? (y/n): " ptero
    if [[ "$ptero" == "y" ]]; then
        read -p "Panel link: " plink
        read -p "API key: " papi
    fi

    read -p "Stripe setup? (y/n): " stripe
    if [[ "$stripe" == "y" ]]; then
        read -p "Secret key: " skey
        read -p "Webhook secret: " sweb
    fi

    read -p "SMTP setup? (y/n): " smtp
    if [[ "$smtp" == "y" ]]; then
        read -p "Host: " shost
        read -p "Port: " sport
        read -p "User: " suser
        read -p "Pass: " spass
        read -p "From: " sfrom
    fi

    echo -e "${GREEN}Saving config...${RESET}"

    jq "
    .panel.panel_name = \"${pname:-Hilos}\" |
    .panel.panel_tagline = \"${ptag:-Premium game & app hosting}\" |
    .admin.email = \"${aemail}\" |
    .admin.username = \"${auser}\" |
    .admin.password = \"${apass}\" |
    .pterodactyl.pterodactyl_url = \"${plink}\" |
    .pterodactyl.pterodactyl_api_key = \"${papi}\" |
    .stripe.stripe_secret_key = \"${skey}\" |
    .stripe.stripe_webhook_secret = \"${sweb}\" |
    .smtp.smtp_host = \"${shost}\" |
    .smtp.smtp_port = ${sport:-587} |
    .smtp.smtp_user = \"${suser}\" |
    .smtp.smtp_password = \"${spass}\" |
    .smtp.smtp_from = \"${sfrom}\"
    " $FILE > tmp.json && mv tmp.json $FILE

    echo -e "${GREEN}DONE${RESET}"
    read -p "Press enter..."
}

delete_files() {
    echo -e "${RED}Deleting...${RESET}"
    rm -rf HILOPANEL hilopanel
    pm2 delete HILOPANEL 2>/dev/null
}

reinstall_files() {
    delete_files
    install_files
}

pm2_status() {
    pm2 status
    read -p "Enter..."
}

while true; do
    clear
    echo -e "${CYAN}"
    echo "====================="
    echo " H I L O   P A N E L "
    echo "====================="
    echo "1) Install"
    echo "2) Setup ENV"
    echo "3) Delete"
    echo "4) Reinstall"
    echo "5) PM2 status"
    echo "0) Exit"
    echo "====================="
    echo -e "${RESET}"

    read -p "Select: " opt

    case $opt in
        1) install_files ;;
        2) setup_env ;;
        3) delete_files ;;
        4) reinstall_files ;;
        5) pm2_status ;;
        0) exit ;;
        *) echo "Invalid"; sleep 1 ;;
    esac
done
