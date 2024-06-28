# [Choice] Debian OS version: bullseye, buster
ARG VARIANT=bullseye
FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# update system packages and cleanup cache
ARG DEBIAN_FRONTEND=noninteractive

# install deno
ENV DENO_INSTALL=/usr/local
RUN /bin/bash -c "$(curl -fsSL https://deno.land/install.sh)" \
    && chown ${USER:-vscode} /usr/local/bin/deno

RUN sudo apt-get -y update \
    && sudo apt-get -y install --no-install-recommends gcc git-extras \
    && sudo apt-get -y upgrade && sudo rm -rf /var/lib/apt/lists/*

RUN echo '[[ ":$PATH:" == *":$HOMEBREW_PREFIX:"* ]] || export PATH="$HOMEBREW_PREFIX/bin:$PATH"; eval "$(brew shellenv)"; { command -v starship &>/dev/null || brew install starship &>/dev/null; } && eval "$(starship init bash)";' >> /home/${USER:-vscode}/.bashrc

RUN sudo mkdir -p /etc/bash_completion.d \
    && sudo deno completions bash > /etc/bash_completion.d/deno.bash
