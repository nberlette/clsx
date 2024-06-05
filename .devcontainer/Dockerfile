# [Choice] Debian OS version: bullseye, buster
ARG VARIANT=bullseye
FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# update system packages and cleanup cache
ARG DEBIAN_FRONTEND=noninteractive
RUN sudo apt-get -y update \
    && sudo apt-get -y install --no-install-recommends gcc git-extras \
    && sudo apt-get -y upgrade && sudo rm -rf /var/lib/apt/lists/*

# install deno
ENV DENO_INSTALL=/usr/local
RUN /bin/bash -c "$(curl -fsSL https://deno.land/install.sh)" \
    && chown ${USER:-vscode} /usr/local/bin/deno
    && deno completions bash > /etc/bash_completion.d/deno
    && deno completions zsh > /usr/share/zsh/vendor-completions/_deno
    && deno upgrade --canary --force

RUN echo '[[ ":$PATH:" != *":$HOMEBREW_PREFIX/bin:"* ]] && export PATH="$HOMEBREW_PREFIX/bin:$PATH"; command -v brew &>/dev/null && eval "$(brew shellenv 2>/dev/null)" && { command -v starship &>/dev/null || brew install starship 2>/dev/null; } && eval "$(starship init bash)";' >> /home/${USER:-vscode}/.bashrc
