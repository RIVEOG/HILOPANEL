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
echo "        H I L O P A N E L"
echo "   CodeSandbox + VPS Compatible"
echo "========================================"
echo -e "${RESET}"

read -p "Are you 13+ and know setup? (y/n): " age
[[ "$age" != "y" ]] && echo -e "${RED}Exit${RESET}" && exit 1


# ================= DEPENDENCIES =================
install_dependencies() {
    echo -e "${YELLOW}Updating system...${RESET}"

    apt update -y && apt upgrade -y

    echo -e "${YELLOW}Installing tools...${RESET}"
    apt install -y git curl wget jq

    echo -e "${YELLOW}Installing Node.js...${RESET}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs

    echo -e "${YELLOW}Installing PM2...${RESET}"
    npm install -g pm2

    echo -e "${GREEN}Dependencies installed${RESET}"
    read -p "Press enter..."
}


# ================= INSTALL =================
install_panel() {
    echo -e "${GREEN}Cloning repo...${RESET}"

    git clone $REPO

    # FIX: auto detect folder
    DIR=$(ls -d */ | grep -i hilopanel | head -n 1)

    if [ -z "$DIR" ]; then
        echo -e "${RED}Folder not found!${RESET}"
        exit 1
    fi

    cd "$DIR" || exit

    echo -e "${YELLOW}Installing npm packages...${RESET}"
    npm install

    # ================= CODE SANDBOX FIX =================
    PORT=${PORT:-3000}

    echo -e "${YELLOW}Starting React (CodeSandbox mode)...${RESET}"

    pm2 delete HILOPANEL 2>/dev/null

    pm2 start npm \
        --name "HILOPANEL" \
        -- run dev -- \
        --host 0.0.0.0 \
        --port $PORT

    pm2 save

    echo -e "${GREEN}Running on 0.0.0.0:$PORT${RESET}"
    read -p "Press enter..."
}


# ================= ENV SETUP =================
setup_env() {
    FILE="ENV.json"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}ENV.json missing${RESET}"
        return
    fi

    read -p "Hosting name: " pname
    read -p "Hosting tag: " ptag

    read -p "Admin setup? (y/n): " admin
    if [[ "$admin" == "y" ]]; then
        read -p "Email: " aemail
        read -p "Username: " auser
        read -p "Password: " apass
    fi

    read -p "Pterodactyl setup? (y/n): " ptero
    if [[ "$ptero" == "y" ]]; then
        read -p "Panel URL: " plink
        read -p "API Key: " papi
    fi

    read -p "Stripe setup? (y/n): " stripe
    if [[ "$stripe" == "y" ]]; then
        read -p "Secret Key: " skey
        read -p "Webhook Secret: " sweb
    fi

    read -p "SMTP setup? (y/n): " smtp
    if [[ "$smtp" == "y" ]]; then
        read -p "Host: " shost
        read -p "Port: " sport
        read -p "User: " suser
        read -p "Pass: " spass
        read -p "From: " sfrom
    fi

    jq "
    .panel.panel_name = \"${pname:-Hilos}\" |
    .panel.panel_tagline = \"${ptag:-Premium hosting}\" |
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

    echo -e "${GREEN}ENV updated${RESET}"
    read -p "Press enter..."
}


# ================= DELETE =================
delete_panel() {
    echo -e "${RED}Deleting panel...${RESET}"
    rm -rf HILOPANEL hilopanel
    pm2 delete HILOPANEL 2>/dev/null
}


# ================= REINSTALL =================
reinstall_panel() {
    delete_panel
    install_panel
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
    echo "=========================="
    echo "   H I L O   P A N E L"
    echo "=========================="
    echo "1) Install Panel"
    echo "2) Setup ENV"
    echo "3) Delete Panel"
    echo "4) Reinstall Panel"
    echo "5) PM2 Status"
    echo "6) Install Dependencies"
    echo "0) Exit"
    echo "=========================="
    echo -e "${RESET}"

    read -p "Select: " opt

    case $opt in
        1) install_panel ;;
        2) setup_env ;;
        3) delete_panel ;;
        4) reinstall_panel ;;
        5) pm2_status ;;
        6) install_dependencies ;;
        0) exit ;;
        *) echo "Invalid"; sleep 1 ;;
    esac
done
