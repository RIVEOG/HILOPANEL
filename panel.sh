#!/bin/bash

# COLORS
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
echo "         copyright content donot use without riveog_ credit"
echo ""
echo "========================================"
echo -e "${RESET}"

read -p "Are you at least 13 years old and know how to setup hilos? (y/n): " age

if [[ "$age" != "y" ]]; then
    echo -e "${RED}Exiting...${RESET}"
    exit 1
fi

REPO="https://github.com/RIVEOG/HILOPANEL.git"
DIR="hilopanel"

function install_files() {
    echo -e "${GREEN}Installing files...${RESET}"
    
    if [ -d "$DIR" ]; then
        echo "Already exists. Skipping clone..."
    else
        git clone $REPO
    fi

    cd $DIR || exit

    chmod +x install.sh
    bash install.sh

    echo -e "${YELLOW}Starting with PM2...${RESET}"

    # detect port (fallback 3000)
    PORT=${PORT:-3000}

    pm2 start npm --name "hilopanel" -- start -- --port $PORT
    pm2 save

    echo -e "${GREEN}Done! Running on port $PORT${RESET}"
    read -p "Press enter to continue..."
}

function setup_env() {
    FILE="$DIR/ENV.json"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}ENV.json not found! Install first.${RESET}"
        return
    fi

    read -p "Hosting Name (default: Hilos): " pname
    read -p "Hosting Tag (default: Premium game & app hosting): " ptag

    read -p "Install admin account? (y/n): " admin

    if [[ "$admin" == "y" ]]; then
        read -p "Admin Email: " aemail
        read -p "Admin Username: " auser
        read -p "Admin Password: " apass
    fi

    read -p "Setup Pterodactyl? (y/n): " ptero
    if [[ "$ptero" == "y" ]]; then
        read -p "Panel Link: " plink
        read -p "API Key: " papi
    fi

    read -p "Configure Stripe? (y/n): " stripe
    if [[ "$stripe" == "y" ]]; then
        read -p "Secret Key: " skey
        read -p "Webhook Secret: " sweb
    fi

    read -p "Configure SMTP? (y/n): " smtp
    if [[ "$smtp" == "y" ]]; then
        read -p "Host: " shost
        read -p "Port (default 587): " sport
        read -p "User: " suser
        read -p "Password: " spass
        read -p "From: " sfrom
    fi

    read -p "Configure free specs? (y/n): " specs
    if [[ "$specs" == "y" ]]; then
        read -p "RAM (1024): " ram
        read -p "CPU (50): " cpu
        read -p "Disk (5120): " disk
        read -p "Server limit (1): " limit
    fi

    read -p "Configure shop costs? (y/n): " shop
    if [[ "$shop" == "y" ]]; then
        read -p "RAM per GB (100): " cram
        read -p "CPU per core (200): " ccpu
        read -p "Disk per GB (50): " cdisk
        read -p "Server slot (500): " cslot
    fi

    echo -e "${GREEN}Updating ENV.json...${RESET}"

    # Use jq (must install: apt install jq)
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
    .smtp.smtp_from = \"${sfrom}\" |

    .defaults.default_ram_mb = ${ram:-1024} |
    .defaults.default_cpu_pct = ${cpu:-50} |
    .defaults.default_disk_mb = ${disk:-5120} |
    .defaults.default_servers = ${limit:-1} |

    .shop_costs.cost_ram_per_gb = ${cram:-100} |
    .shop_costs.cost_cpu_per_core = ${ccpu:-200} |
    .shop_costs.cost_disk_per_gb = ${cdisk:-50} |
    .shop_costs.cost_server_slot = ${cslot:-500}
    " $FILE > tmp.json && mv tmp.json $FILE

    echo -e "${GREEN}DONE${RESET}"
    read -p "Press enter to continue..."
}

function delete_files() {
    echo -e "${RED}Deleting files...${RESET}"
    rm -rf $DIR
    pm2 delete hilopanel 2>/dev/null
    echo "Deleted."
}

function reinstall_files() {
    delete_files
    install_files
}

function pm2_status() {
    pm2 status
    read -p "Press enter to continue..."
}

while true; do
    clear
    echo -e "${CYAN}"
    echo "====================="
    echo " H I L O   P A N E L "
    echo "====================="
    echo "1) Install files"
    echo "2) Setup"
    echo "3) Delete files"
    echo "4) Reinstall files"
    echo "5) PM2 status"
    echo "0) Exit"
    echo "====================="
    echo -e "${RESET}"

    read -p "Enter your selection: " opt

    case $opt in
        1) install_files ;;
        2) setup_env ;;
        3) delete_files ;;
        4) reinstall_files ;;
        5) pm2_status ;;
        0) exit ;;
        *) echo "Invalid option"; sleep 1 ;;
    esac
done
