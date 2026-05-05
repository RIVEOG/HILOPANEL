#!/bin/bash

REPO="https://github.com/RIVEOG/HILOPANEL.git"
FOLDER="HILOPANEL"
APP_NAME="HILOPANEL"

# COLORS
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ---------- Detect Port ----------
detect_port() {
    if grep -q "\"dev\":.*vite" package.json 2>/dev/null; then
        echo "5173"
        return
    fi

    if grep -q "\"start\":.*react-scripts" package.json 2>/dev/null; then
        echo "3000"
        return
    fi

    echo "3000"
}

# ---------- Install Dependencies ----------
install_dependencies() {
    echo -e "${CYAN}Installing dependencies...${NC}"

    apt update -y
    apt install -y git curl jq

    if ! command -v node >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi

    if ! command -v pm2 >/dev/null 2>&1; then
        npm install -g pm2
    fi

    echo -e "${GREEN}Dependencies installed${NC}"
}

# ---------- Clone / Update ----------
clone_or_update() {
    if [ -d "$FOLDER/.git" ]; then
        echo -e "${YELLOW}Updating repo...${NC}"
        cd "$FOLDER" || exit
        git reset --hard
        git pull
    else
        git clone "$REPO"
        cd "$FOLDER" || exit
    fi
}

# ---------- Start App (FIXED CORE) ----------
start_app() {
    PORT=$(detect_port)

    echo -e "${CYAN}Starting on port $PORT${NC}"

    pm2 delete "$APP_NAME" >/dev/null 2>&1

    if grep -q "\"dev\":.*vite" package.json 2>/dev/null; then
        pm2 start "npm run dev -- --host 0.0.0.0 --port $PORT" --name "$APP_NAME"

    elif grep -q "\"start\":.*react-scripts" package.json 2>/dev/null; then
        PORT=$PORT HOST=0.0.0.0 pm2 start npm --name "$APP_NAME" -- start

    else
        PORT=$PORT HOST=0.0.0.0 pm2 start npm --name "$APP_NAME" -- start
    fi

    pm2 save

    echo -e "${GREEN}Panel running on port $PORT${NC}"
}

# ---------- Install Panel ----------
install_panel() {
    install_dependencies
    clone_or_update

    echo -e "${CYAN}Installing npm packages...${NC}"
    npm install

    start_app
}

# ---------- ENV SETUP (SAFE UPDATE) ----------
setup_env() {
    cd "$FOLDER" 2>/dev/null || { echo "Install first"; return; }

    FILE="ENV.json"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}ENV.json not found${NC}"
        return
    fi

    read -p "Hosting Name (Hilos): " pname
    read -p "Hosting Tagline: " ptag

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
        read -p "Password: " spass
        read -p "From: " sfrom
    fi

    echo -e "${CYAN}Updating ENV.json safely...${NC}"

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

    echo -e "${GREEN}ENV updated successfully${NC}"
}

# ---------- Delete ----------
delete_panel() {
    rm -rf "$FOLDER"
    pm2 delete "$APP_NAME" 2>/dev/null
    echo -e "${RED}Deleted${NC}"
}

# ---------- MENU ----------
while true
do
clear
echo "======================================"
echo "         H I L O P A N E L            "
echo "======================================"
echo "1) Install / Run Panel"
echo "2) Setup ENV"
echo "3) Delete Panel"
echo "4) Restart Panel"
echo "5) PM2 Status"
echo "6) Install Dependencies"
echo "0) Exit"
echo "======================================"

read -p "Select Option: " choice

case $choice in
1) install_panel ;;
2) setup_env ;;
3) delete_panel ;;
4) pm2 restart "$APP_NAME" ;;
5) pm2 status ;;
6) install_dependencies ;;
0) exit ;;
*) echo "Invalid Option" ;;
esac

read -p "Press Enter To Continue..."
done
