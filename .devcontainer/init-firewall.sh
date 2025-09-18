#!/bin/bash

# Firewall initialization script for Paramarsh SMS DevContainer
# Provides network security while allowing necessary connections

echo "🔒 Initializing firewall for Paramarsh SMS DevContainer..."

# Check if running as root (needed for iptables)
if [ "$EUID" -ne 0 ]; then 
    echo "Running firewall setup with sudo..."
    sudo "$0" "$@"
    exit
fi

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Set default policies
iptables -P INPUT ACCEPT
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow DNS (port 53)
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow HTTP/HTTPS for package managers and git
iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH (port 22) for git operations
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT

# Whitelist specific domains for development
# NPM Registry
iptables -A OUTPUT -d registry.npmjs.org -j ACCEPT
iptables -A OUTPUT -d registry.yarnpkg.com -j ACCEPT

# GitHub
iptables -A OUTPUT -d github.com -j ACCEPT
iptables -A OUTPUT -d api.github.com -j ACCEPT
iptables -A OUTPUT -d raw.githubusercontent.com -j ACCEPT
iptables -A OUTPUT -d github.githubassets.com -j ACCEPT
iptables -A OUTPUT -d codeload.github.com -j ACCEPT

# Vercel (for deployment)
iptables -A OUTPUT -d vercel.com -j ACCEPT
iptables -A OUTPUT -d api.vercel.com -j ACCEPT
iptables -A OUTPUT -d vercel.app -j ACCEPT

# Clerk (authentication)
iptables -A OUTPUT -d clerk.com -j ACCEPT
iptables -A OUTPUT -d api.clerk.com -j ACCEPT
iptables -A OUTPUT -d clerk.dev -j ACCEPT

# Anthropic/Claude
iptables -A OUTPUT -d anthropic.com -j ACCEPT
iptables -A OUTPUT -d api.anthropic.com -j ACCEPT
iptables -A OUTPUT -d claude.ai -j ACCEPT

# Package CDNs
iptables -A OUTPUT -d unpkg.com -j ACCEPT
iptables -A OUTPUT -d cdnjs.cloudflare.com -j ACCEPT
iptables -A OUTPUT -d cdn.jsdelivr.net -j ACCEPT

# Development tools
iptables -A OUTPUT -d deb.debian.org -j ACCEPT
iptables -A OUTPUT -d security.debian.org -j ACCEPT
iptables -A OUTPUT -d download.docker.com -j ACCEPT

# PostgreSQL repos
iptables -A OUTPUT -d apt.postgresql.org -j ACCEPT

# Bun
iptables -A OUTPUT -d bun.sh -j ACCEPT

# pnpm
iptables -A OUTPUT -d pnpm.io -j ACCEPT

# Log dropped packets (for debugging)
iptables -A OUTPUT -m limit --limit 2/min -j LOG --log-prefix "Firewall Dropped: " --log-level 4

# Save rules
if command -v iptables-save >/dev/null 2>&1; then
    iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
fi

echo "✅ Firewall initialized successfully"
echo ""
echo "Allowed connections:"
echo "  - Loopback interface"
echo "  - DNS queries"
echo "  - HTTP/HTTPS for package managers"
echo "  - SSH for git"
echo "  - Whitelisted domains (npm, GitHub, Vercel, Clerk, etc.)"
echo ""
echo "Blocked:"
echo "  - All other outbound connections"
echo "  - All forwarding"
echo ""
echo "To check firewall status: sudo iptables -L -n -v"
echo "To temporarily disable: sudo iptables -P OUTPUT ACCEPT"
echo "To re-enable: sudo /home/node/init-firewall.sh"