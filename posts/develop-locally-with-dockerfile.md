# How to develop locally

## Problem

Years of debugging convuluted sytems have given me a couple of core principles:

- Automation is the preventative medicine against the disease that is technical debt.
- Executable documentation is the form of documentation you can consistently rely on.

These principles are applicable in many facets of software engineering, but best practice starts at home and the first place we need to apply these principles is in our own approach to local development.

Firstly, do any of these scenarios sound familiar?

1. You were diligent and documented your setup perfectly in your README... six months ago. Now half the steps are wrong, and you're debugging your own instructions on a new machine.

2. Your code runs flawlessly locally. Yet you'll spend half your development cycle deploying and debugging in a production like environment (or let's be honest... in production).

3. A new team member joins. Day one becomes week one as they navigate undocumented dependencies, missing environment variables, and the new member must meditate on the sisyphean reality of onboarding, so succinctly intimated as "oh yeah, you also need to install..."

4. You feel it is time to return to that world changing project abandoned. You spend the first hour trying to figure out how to get it to run, dooming its already uncertain revival for a new, better project that you definitely won't abandon.

5. You enter negotations with the devil himself to keep your unnervingly hot, hissing, and outdated laptop alive rather than that company mandated upgrade because migrating to a new machine might just kill you. Besides, you haven't used your soul once since LLMs came around.

6. Your team is now evenly split between silicon and intel processor users. Now it's time to give your clients the bad news that you are shutting down the service because consistent on-call support is officially impossible. It was a good run.

## Requirements of an ideal solution

We face a fundamental tension as software engineers: we want the speed and ease of developing locally on our machines while also wanting to maintain parity with production environments to minimize deployment snafus.

We could write our software inside of a dedicated cloud based development space. But we'll likely run into the headwinds of a slower connection, additional cloud fees, and a more cumbersome setup.

If we manage our local development by installing all of our preferred and required tools manually, we're maxinmizing flexibility and speed, but it is challenging to replicate and we'll hit most of the problems we outlined above.

My proposal then is an approach that tries to minimize these tradeoffs and stirkes a balance between convience and parity. Namely, using docker containers on our local machines with a few additional strategies to give us that tailored local development feel we do our best work in while solving the local development issues we've mostly just begrudingly accepted drudging through.

## The brass tacks of Docker-based development

Let's outline the advantages and challenges we'll face with my proposed methodology.

Advantages:

- Your local development container more closely mirrors production containers than your bespoke local development setup.
- Docker gives us much better reproducibility. We should expect commands like `docker build`, `docker run`, and `docker-compose up` to work identically across machines.
- We achieve a self-documenting workflow since our dependencies are explicitly declared in Dockerfiles.
- Multiple projects with conflicting dependencies can coexist peacefully.
- We have a version controlled development environment because the whole setup is now code.

Challenges:

- Volume mounts can be slower than native file access.
- Container debugging requires basic Linux skills. (but come on... you should have/want those).
- Containers are ephemeral; customizations need persistence strategies.
- We need to manage IDE integration complexity. Modern IDEs handle this better, but setup remains non-trivial.

## How we can minimize the challenges and maximize the advantages?

My proposed approach is to combine Docker's reproducability with local development's convenience through a few straegic design choices. Namely:

1. Use a carefully crafted base image with your preferred tools, extending it for specific projects rather than starting fresh each time.

2. Mount your source code into containers while keeping it accessible to local IDEs. Changes in either location sync instantly.

### A quick aside on managing dotfiles

I want to make an aside/suggestion on a prerequisite that will make our containers come pre-configured with our local enviornment's preferred tooling and settings is to have good dotfile management.

Namely, my recommendation for the  the tool [`stow`](https://www.gnu.org/software/stow/). I won't go into detail about how to set this up or use this tool, but, in a nutshell we want to keep our dotfiles (`.zshrc`, `.vim`, `etc.`) in a dotfiles directory that symlinks to our home directory.

This is becaue Docker can only access files in its "build context"; the directory where you run `docker build`. So as part of our build process we want to copy dotfiles into our build context first first. Having a common place for our dotfiles, means that we can copy these dotfiles consistently.

So after using stow, my home directory looks something like this:

```bash
/home/user
├── .bash_history
├── .bash_logout
├── .bashrc -> dotfiles/.bashrc # notice the symlink
├── .bashrc.bak
├── .config -> dotfiles/.config # notice the symlink
├── Desktop
├── Documents
├── dotfiles
│   ├── .bashrc
│   ├── .config
│   ├── .gitignore
│   ├── .oh-my-zsh
│   ├── README.md
│   ├── .zcompdump
│   └── .zshrc
├── .gitconfig
├── Music
├── .oh-my-zsh -> dotfiles/.oh-my-zsh # notice the symlink
├── Pictures
├── Projects
├── Public
├── .ssh # this is a dotfile, but we don't want to be copying .ssh keys
├── .zcompdump -> dotfiles/.zcompdump # should this be copied into my dotfiles?
├── .zsh_history
├── .zshrc -> dotfiles/.zshrc # notice the symlink
└── .zshrc.pre-oh-my-zsh -> dotfiles/.zshrc
```

Notice that my dotfiles are in a shared directory and being symlinked back, So I can reference and pull in my preferred configurations to my base development container.

### Our `dev-base` container

Now let's talk about our `dev-base` image that will bring our local preferred tools and settings into our project's containers.

First things first, we'll create a Dockerfile with a preferred image. I tend to work out of Debian, so I develop most of my projects in a Debian environemnt, but this base image can be set to match whatever your preferred or required environment is.

We do this by defining our `FROM` command like so:

```Dockerfile
FROM debian:bookworm-slim
```

Next, we want our base image to be useful by installing our preferred development tools that we don't want to have to manually replicate across every development container. 

Many of these tools may already come pre-installed on your image, but it doesn't hurt to specifiy them for the sake of clarity. Here's an example:

```Dockerfile
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    zsh \
    vim \
    nano \
    build-essential \
    unzip \
    ca-certificates \
    sudo \
    htop \
    tree \
    jq \
    openssh-client \
    gnupg2 \
    less \
    netcat-openbsd \
    dnsutils \
    ripgrep \
    fd-find \
    && rm -rf /var/lib/apt/lists/*
```

You can see that I am installing things like `tree`, `htop` `zsh`, and `vim` which are tools I use frequently and want to have access to in all of my development environments.

Next we should create a non-root user to avoid pmission issues with mounted volumes:

```Dockerfile
ARG USERNAME=devuser
# UID 1000 typically matches the first user on Linux systems
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt" >> /etc/sudoers
```

For additional installations, we can switch to our user in our base Dockerfile.

For example, I prefer developing with an add-on to my `zsh` terminal called `oh-my-zsh` among other popular plugins and themes for my shell. These are examples of the kind of tooling I don't want to install and reconfigure every time I set up a new Debian based project.

Now my preferred fonts, themes, and tools are installed every time I use an image that draws from this base.

```Dockerfile
USER $USERNAME
WORKDIR /home/$USERNAME

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install popular zsh plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
    && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Install Spaceship theme
RUN git clone https://github.com/spaceship-prompt/spaceship-prompt.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt --depth=1 \
    && ln -s ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt/spaceship.zsh-theme ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship.zsh-theme

```

Now let's copy in our dotfiles with our preferred settings and configurations. Note, that in our Dockerfile we are making an assumption that our dotfiles directory is in the same direcory with our Dockerfile. A reminder from earlier that Docker cannot copy something outside of its context space.

In a shell script that we'll review later, we'll manage the copying and cleaning up of our dotfiles into the directory where our base Dockerfile is.

```Dockerfile
# These are just two examples of configurations I want copied in. I don't need every dotfile, but as time passes and my tooling changes, I can always add additional COPY lines for future dotfiles.
COPY --chown=$USERNAME:$USERNAME dotfiles/.zshrc /home/$USERNAME/.zshrc
COPY --chown=$USERNAME:$USERNAME dotfiles/.vimrc /home/$USERNAME/.vimrc
```

Lastly, we just need to set our working directory and our preferred shell. Given all of the related configs, I want `zsh` as my default terminal.

```Dockerfile
RUN mkdir -p /home/$USERNAME/workspace

WORKDIR /home/$USERNAME/workspace

CMD ["/bin/zsh"]
```

The whole thing will look like this:

```Dockerfile
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    zsh \
    vim \
    nano \
    build-essential \
    unzip \
    ca-certificates \
    sudo \
    htop \
    tree \
    jq \
    openssh-client \
    gnupg2 \
    less \
    netcat-openbsd \
    dnsutils \
    ripgrep \
    fd-find \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=devuser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt" >> /etc/sudoers

USER $USERNAME
WORKDIR /home/$USERNAME

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install popular zsh plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
    && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Install Spaceship theme
RUN git clone https://github.com/spaceship-prompt/spaceship-prompt.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt --depth=1 \
    && ln -s ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt/spaceship.zsh-theme ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship.zsh-theme

COPY --chown=$USERNAME:$USERNAME dotfiles/.zshrc /home/$USERNAME/.zshrc
COPY --chown=$USERNAME:$USERNAME dotfiles/.vimrc /home/$USERNAME/.vimrc

RUN mkdir -p /home/$USERNAME/workspace

WORKDIR /home/$USERNAME/workspace

CMD ["/bin/zsh"]
```

Now, let's be good stewards of this beautiful Dockerfile we've created and manage the creation and setup with a bash script. This also further fulfills our principle of executable code being superior documentation than straight text in a README.

We need our script to do the following

1. Copy our dotfiles directory into our Dockerfile's local directory
2. Build our docker image so other containers can pull from this local image
3. Clean up our temporary dotfiles directory.

I won't go through a full walkthrough, but here's my version of the script:

```bash
#!/bin/bash

set -euo pipefail

# Check if DOTFILES_DIR env variable is set, if not prompt user
if [[ -z "${DOTFILES_DIR:-}" ]]; then
    read -p "Enter dotfiles directory path: " -r DOTFILES_DIR
    DOTFILES_DIR="${DOTFILES_DIR/#\~/$HOME}"
    export DOTFILES_DIR
fi

if [[ ! -d "$DOTFILES_DIR" ]]; then
    echo "Error: Dotfiles directory not found: $DOTFILES_DIR" >&2
    exit 1
fi

echo "Using dotfiles from: $DOTFILES_DIR"

trap "rm -rf ./dotfiles" EXIT

cp -rT "$DOTFILES_DIR" "./dotfiles"

# Build the image, passing DOTFILES_DIR as build argument
BUILD_DATE=$(date +%Y%m%d)
docker build -f Dockerfile.base \
  -t dev-base:latest \
  -t dev-base:$BUILD_DATE .

echo "✅ Built dev-base:latest and dev-base:$BUILD_DATE"

echo "cleaning up temp dotfiles directory"
```

Now We have this dev-base image on our local machines, and future development containers can build on top of this.

```bash
➜ docker images
REPOSITORY   TAG        IMAGE ID       CREATED         SIZE
dev-base     20250802   6351a5d71ff7   3 minutes ago   612MB
dev-base     latest     6351a5d71ff7   3 minutes ago   612MB
```

Now let's go through a few example projects that can build on top of this base image.

## Example: Unique LaTeX Usecase

Here's a real-world example where Docker converts a painful setup into a clean, self-documented, and version controlled onboarding process.

I chose LaTeX screenplay writing deliberately, not because it's common, but because it illustrates the kind of specialized development environment that would normally require:

- Manual download and installation of obscure packages
- Knowledge of TeX directory structures
- System-specific configuration that varies between macOS/Linux/WSL
- Documentation that inevitably goes stale

This is exactly where containerization pays massive dividends. What would normally be a arduous setup with moments of confusion and belwiderment becomes a simple matter of executing a `docker run` command.

```Dockerfile
FROM dev-base:latest

USER root

RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    && rm -rf /var/lib/apt/lists/*

# Install screenplay package from the official source
RUN cd /tmp && \
    # Download the screenplay package
    wget http://dvc.org.uk/sacrific.txt/screenplay.zip && \
    echo "8ec5210bcd4d3c2a7d961f4a9a7472c9fea8a7b00907dc7601465a947413a265  screenplay.zip" | sha256sum -c - && \
    unzip screenplay.zip && \
    # Generate the class files using the provided installer
    latex screenplay.ins && \
    # Create the correct directory where TeX looks for local packages
    mkdir -p /usr/local/share/texmf/tex/latex/screenplay && \
    # Copy the generated files to the correct location
    cp screenplay.cls /usr/local/share/texmf/tex/latex/screenplay/ && \
    cp hardmarg.sty /usr/local/share/texmf/tex/latex/screenplay/ && \
    # Update the TeX filename database for the local tree
    mktexlsr /usr/local/share/texmf && \
    # Copy example files to permanent location
    mkdir -p /usr/local/share/screenplay-examples && \
    cp example.tex test.tex /usr/local/share/screenplay-examples/

# Verify installation works by testing if TeX can find the class
RUN kpsewhich screenplay.cls

# Create an entrypoint script that copies examples directory and starts bash
RUN echo '#!/bin/bash' > /usr/local/bin/entrypoint.sh && \
    echo 'cp -r /usr/local/share/screenplay-examples /home/devuser/workspace/ 2>/dev/null || true' >> /usr/local/bin/entrypoint.sh && \
    echo 'exec "$@"' >> /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh


USER devuser
WORKDIR /home/devuser/workspace

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/bin/zsh"]
```

We can then add a basic `run-dev.sh` shell script that will build and run our project for us.

```bash
#!/bin/bash

# Build the image
docker build -t screenplay-latex .

# Run container with interactive terminal and volume mounting
docker run -it --rm -v "$(pwd):/home/devuser/workspace" screenplay-latex
```

## A relatively normal web development example

```Dockerfile
FROM dev-base:latest

USER root

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install web development tools globally
RUN npm install -g \
    http-server \
    live-server \
    prettier

# Copy entrypoint script that starts web server and keeps container running
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy helper script for common development tasks
COPY webdev-helper.sh /usr/local/bin/webdev
RUN chmod +x /usr/local/bin/webdev

USER devuser
WORKDIR /home/devuser/workspace

# Expose ports for web servers
EXPOSE 8000 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
```

Here is the base script and the referenced helper scripts from the webdev Dockerfile:

### `run-dev.sh`

```bash
#!/bin/bash

# Stop and remove any existing container first
echo "Cleaning up existing container..."
docker stop branhoff-web-dev 2>/dev/null || true
docker rm branhoff-web-dev 2>/dev/null || true

# Build the development image
echo "Building web development container..."
if ! docker build -f Dockerfile.dev -t web-dev:latest .; then
    echo "Build failed! Exiting..." >&2
    exit 1
fi

# Debug: Show what we're mounting
echo "================================================================"
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la
echo "================================================================"

echo "Starting web development container..."
echo "Access your site at:"
echo "  - http://localhost:8000 (basic server)"
echo "  - http://localhost:8080 (live-reload server)"
echo ""
echo "To access the container shell:"
echo "  docker exec -it branhoff-web-dev /bin/zsh"
echo ""
echo "Inside the container, use:"
echo "  webdev live    # Start live-reload server"
echo "  webdev serve   # Start basic server"  
echo "  webdev format  # Format your code"
echo "================================================================"

# Run container with volume mounting
if ! docker run -d \
  --name branhoff-web-dev \
  -p 8000:8000 \
  -p 8080:8080 \
  -v "$(pwd):/home/devuser/workspace" \
  web-dev:latest; then
    echo "Failed to start container! Exiting..." >&2
    exit 1
fi

echo "Container started! Basic server running on port 8000."
echo ""
echo "Verify the mount worked:"
echo "  docker exec branhoff-web-dev ls -la /home/devuser/workspace"
echo ""
echo "Access the shell:"
echo "  docker exec -it branhoff-web-dev /bin/zsh"
```

### `entrypoint.sh`

```bash
#!/bin/bash
echo "=== Web Development Container ==="
echo "Starting Node.js HTTP server on port 8000..."
echo "Access your site at: http://localhost:8000"

cd /home/devuser/workspace
http-server -p 8000 --host 0.0.0.0 &
SERVER_PID=$!

cleanup() {
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

exec "$@"
```

### `webdev-helper.sh`

```bash
#!/bin/bash
case "$1" in
  "serve")
    echo "Starting http-server on port 8000..."
    http-server -p 8000 --host 0.0.0.0
    ;;
  "live")
    echo "Starting live-server with auto-reload..."
    live-server --port=8080 --host=0.0.0.0
    ;;
  "format")
    echo "Formatting HTML, CSS, and JS files..."
    prettier --write "**/*.{html,css,js,json}"
    ;;
  "validate")
    echo "Validating JSON files..."
    find . -name "*.json" -exec jq . {} \;
    ;;
  *)
    echo "Usage: webdev {serve|live|format|validate}"
    echo "  serve    - Start http-server on port 8000"
    echo "  live     - Start live-server with auto-reload on port 8080"
    echo "  format   - Format HTML/CSS/JS files with Prettier"
    echo "  validate - Validate JSON files"
    ;;
esac
```

This hopefully gives you some ideas of how you can have your "local development" cake and eat it too. There are many other topics that can be expanded upon.
- docker-compose
- dockerignore
- 

## Additional Material and References

- [How I manage my dotfiles using GNU Stow](https://tamerlan.dev/how-i-manage-my-dotfiles-using-gnu-stow/)

---

## Stream of conciousness

Local development is a fundamental problem. We must balance convience while minimizing differences between our production environements.

Cloud based environments (Often require our IDEs to SSH, making it slow and cumbersome)
Local environemnts (faster and easier to incorporate useful development tools, but a weaker correlation with production environemtns)

At a minimum our local development environments should be built off of a Dockerfile.

What most people do that is worse possible scenario:

- Everyone is developing on different operating systems
- Manual Steps like setting the correct environment variables
- Having to manually install languages, editors, tooling
- Having to manage multiple projects and trying to prevent conflicts across various tooling (switching java or python versions for instance)
- Local development changes not being recorded by long-term members, making the onboarding process of new engineers expensive and time consuming

A Solution:
Develop inside of a local docker container where we mount locally to make connecting our IDEs easy.

A Problem and a Solution:
The only issue with developing inside of a fresh container is that we'll lose many of our preferred local development tools. For instance, I rely heavily on the `zsh` terminal extension `oh-my-zsh` for autocompleting frequently run commands or my aliases that I'm accustomed too.

It would be a pain across projects to have to install each of these manually in every container and reset everything up. So, to reduce this burden, we can create a "base development" container that we can extend onto. We'll copy our dotfiles into a dotfiles directory

### base-dev container

Use stow to help manage your dotfiles in a dotfiles directory.

```bash
#!/bin/bash

set -e

# Check if DOTFILES_DIR is set, if not prompt user
if [[ -z "$DOTFILES_DIR" ]]; then
    read -p "Enter dotfiles directory path: " -r DOTFILES_DIR
    DOTFILES_DIR="${DOTFILES_DIR/#\~/$HOME}"
    export DOTFILES_DIR
fi

echo "Using dotfiles from: $DOTFILES_DIR"

cp -r $DOTFILES_DIR .

# Build the image, passing DOTFILES_DIR as build argument
docker build -f Dockerfile.base -t dev-base:latest --build-arg DOTFILES_DIR="$DOTFILES_DIR" .

echo "✅ Built dev-base:latest"

echo "cleaning up temp dotfiles directory"
rm -rf ./dotfiles
```

```Dockerfile
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    zsh \
    vim \
    nano \
    build-essential \
    unzip \
    ca-certificates \
    sudo \
    htop \
    tree \
    jq \
    locales \
    && rm -rf /var/lib/apt/lists/*

# Create consistent user
ARG USERNAME=devuser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Switch to user for oh-my-zsh installation
USER $USERNAME
WORKDIR /home/$USERNAME

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install popular zsh plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
    && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Install Spaceship theme
RUN git clone https://github.com/spaceship-prompt/spaceship-prompt.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt --depth=1 \
    && ln -s ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship-prompt/spaceship.zsh-theme ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/spaceship.zsh-theme

# Copy our curated dotfiles into the image
ARG DOTFILES_DIR
COPY --chown=$USERNAME:$USERNAME dotfiles/.zshrc /home/$USERNAME/.zshrc
COPY --chown=$USERNAME:$USERNAME dotfiles/.gitconfig /home/$USERNAME/.gitconfig
COPY --chown=$USERNAME:$USERNAME dotfiles/.vimrc /home/$USERNAME/.vimrc

RUN mkdir -p /home/$USERNAME/workspace

WORKDIR /home/$USERNAME/workspace

CMD ["/bin/zsh"]
```

### Development container

```bash
#!/bin/bash

# Build the image
docker build -t screenplay-latex .

# Run container with interactive terminal and volume mounting
docker run -it --rm -v "$(pwd):/home/devuser/workspace" screenplay-latex
```

screenplay-latex project

```Dockerfile
FROM dev-base:latest

USER root

RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install screenplay package from the official source
RUN cd /tmp && \
    # Download the screenplay package
    wget http://dvc.org.uk/sacrific.txt/screenplay.zip && \
    unzip screenplay.zip && \
    # Generate the class files using the provided installer
    latex screenplay.ins && \
    # Create the correct directory where TeX looks for local packages
    mkdir -p /usr/local/share/texmf/tex/latex/screenplay && \
    # Copy the generated files to the correct location
    cp screenplay.cls /usr/local/share/texmf/tex/latex/screenplay/ && \
    cp hardmarg.sty /usr/local/share/texmf/tex/latex/screenplay/ && \
    # Update the TeX filename database for the local tree
    mktexlsr /usr/local/share/texmf && \
    # Copy example files to permanent location
    mkdir -p /usr/local/share/screenplay-examples && \
    cp example.tex test.tex /usr/local/share/screenplay-examples/

# Verify installation works by testing if TeX can find the class
RUN kpsewhich screenplay.cls

# Create an entrypoint script that copies examples directory and starts bash
RUN echo '#!/bin/bash' > /usr/local/bin/entrypoint.sh && \
    echo 'cp -r /usr/local/share/screenplay-examples /home/devuser/workspace/ 2>/dev/null || true' >> /usr/local/bin/entrypoint.sh && \
    echo 'exec "$@"' >> /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh


USER devuser
WORKDIR /home/devuser/workspace

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/bin/zsh"]
```
