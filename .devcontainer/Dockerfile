FROM node:20-bullseye

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    sudo \
    zsh \
    postgresql-client \
    build-essential \
    python3 \
    iptables \
    iputils-ping \
    dnsutils \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL 15
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list' \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update \
    && apt-get install -y postgresql-15 postgresql-contrib-15 \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    @nestjs/cli \
    prisma \
    tsx \
    playwright \
    @playwright/test \
    concurrently \
    wait-on \
    npm-check-updates

# Install pnpm and bun globally
RUN npm install -g pnpm@latest
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/

# Create node user if it doesn't exist
RUN id -u node &>/dev/null || useradd -m -s /bin/zsh node

# Give node user sudo access
RUN echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Setup PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER paramarsh WITH SUPERUSER PASSWORD 'paramarsh123';" && \
    createdb -O paramarsh paramarsh_sms

USER root

# Configure PostgreSQL to allow connections
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    echo "listen_addresses='*'" >> /etc/postgresql/15/main/postgresql.conf

# Create workspace directory
RUN mkdir -p /workspace && chown -R node:node /workspace

# Switch to node user
USER node
WORKDIR /home/node

# Install Oh My Zsh for node user
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Configure Zsh
RUN echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc && \
    echo 'export EDITOR="vim"' >> ~/.zshrc && \
    echo 'alias ll="ls -la"' >> ~/.zshrc && \
    echo 'alias gs="git status"' >> ~/.zshrc && \
    echo 'alias gc="git commit"' >> ~/.zshrc && \
    echo 'alias gp="git push"' >> ~/.zshrc && \
    echo 'alias nr="npm run"' >> ~/.zshrc && \
    echo 'alias pr="pnpm run"' >> ~/.zshrc && \
    echo 'alias br="bun run"' >> ~/.zshrc

# Set working directory
WORKDIR /workspace

# Copy firewall initialization script
COPY --chown=node:node .devcontainer/init-firewall.sh /home/node/init-firewall.sh
RUN chmod +x /home/node/init-firewall.sh

# Expose ports
EXPOSE 3000 3001 3005 5432 6379 8080

# Set default shell
SHELL ["/bin/zsh", "-c"]

# Keep container running
CMD ["tail", "-f", "/dev/null"]