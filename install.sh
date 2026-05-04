#!/bin/bash

# ================= COLORS =================
CYAN="\033[1;36m"
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

REPO="https://github.com/RIVEOG/HILOPANEL.git"
DIR=""

clear

echo -e "${CYAN}"
echo "========================================"
echo ""
echo "   N E T H O S T   →   H I L O P A N E L"
echo "   Premium Game & App Hosting Panel"
echo ""
echo "========================================"
echo -e "${RESET}"

read -p "Are you at least 13 years old? (y/n): " age

if [[ "$age" != "y" ]]; then
    echo -e "${RED}Exiting...${RESET}"
    exit 1
fi

# ================= DEPENDENCIES =================
install_dependencies() {
    echo -e "${YELLOW}Updating system...${RESET}"

    apt update -y && apt upgrade -y

    echo -e "${YELLOW}Installing base tools...${RESET}"
    apt install -y git curl wget jq

    echo -e "${YELLOW}Installing Node.js...${RESET}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs

    echo -e "${YELLOW}Installing PM2...${RESET}"
    npm install -g pm2

    echo -e "${GREEN}All dependencies installed!${RESET}"
    read -p "Press enter..."
}

# ================= INSTALL =================
install_files() {
    echo -e "${GREEN}Cloning repository...${RESET}"

    git clone $REPO

    # FIX: auto-detect folder (no cd errors)
    DIR=$(ls -d */ | grep -i hilopanel | head -n 1)

    if [ -z "$DIR" ]; then
        echo -e "${RED}Folder not found after clone!${RESET}"
        exit 1
    fi

    cd "$DIR" || exit

    echo -e "${YELLOW}Running install script...${RESET}"
    chmod +x install.sh
    bash install.sh

    echo -e "${YELLOW}Starting with PM2...${RESET}"

    PORT=${PORT:-3000}

    pm2 start npm --name "HILOPANEL" -- start -- --port $PORT
    pm2 save

    echo -e "${GREEN}Running on port $PORT${RESET}"
    read -p "Press enter..."
}

# ================= SETUP ENV =================
setup_env() {
    FILE="ENV.json"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}ENV.json not found. Run install first.${RESET}"
        return
    fi

    read -p "Hosting Name (Hilos): " pname
    read -p "Hosting Tag (Premium game & app hosting): " ptag

    read -p "Setup admin account? (y/n): " admin

    if [[ "$admin" == "y" ]]; then
        read -p "Admin Email: " aemail
        read -p "Admin Username: " auser
        read -p "Admin Password: " apass
    fi

    read -p "Setup Pterodactyl? (y/n): " ptero
    if [[ "$ptero" == "y" ]]; then
        read -p "Panel URL: " plink
        read -p "API Key: " papi
    fi

    read -p "Setup Stripe? (y/n): " stripe
    if [[ "$stripe" == "y" ]]; then
        read -p "Secret Key: " skey
        read -p "Webhook Secret: " sweb
    fi

    read -p "Setup SMTP? (y/n): " smtp
    if [[ "$smtp" == "y" ]]; then
        read -p "Host: " shost
        read -p "Port: " sport
        read -p "User: " suser
        read -p "Password: " spass
        read -p "From: " sfrom
    fi

    echo -e "${GREEN}Updating config...${RESET}"

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

# ================= DELETE =================
delete_files() {
    echo -e "${RED}Deleting project...${RESET}"
    rm -rf HILOPANEL hilopanel
    pm2 delete HILOPANEL 2>/dev/null
}

# ================= REINSTALL =================
reinstall_files() {
    delete_files
    install_files
}

# ================= PM2 STATUS =================
pm2_status() {
    pm2 status
    read -p "Press enter..."
}

# ================= MENU =================
while true; do
    clear

    echo -e "${CYAN}"
    echo "========================="
    echo "   H I L O   P A N E L"
    echo "========================="
    echo "1) Install Panel"
    echo "2) Setup ENV"
    echo "3) Delete Panel"
    echo "4) Reinstall Panel"
    echo "5) PM2 Status"
    echo "6) Install Dependencies"
    echo "0) Exit"
    echo "========================="
    echo -e "${RESET}"

    read -p "Select option: " opt

    case $opt in
        1) install_files ;;
        2) setup_env ;;
        3) delete_files ;;
        4) reinstall_files ;;
        5) pm2_status ;;
        6) install_dependencies ;;
        0) exit ;;
        *) echo "Invalid option"; sleep 1 ;;
    esac
done
