## Setup

For development, you only need Nix installed (no python, pip, IDE, or anything else required).  
Once installed, run the shell script in `./env.sh` which will start a Nix shell
    - Note: If you check the contents of this shell script, it's just running a single command. You can alias this locally if you want. 
When you start the Nix shell you'll be prompted with a message detailing aliased commands you can use. 

## Deployment

Currently deployment is done manually. You can deploy via scp or via git, whichever you prefer.
The server only really required Docker. Other configurations (ufw, caddy, users, etc. ) aren't included in this setup.

### Git

Git clone the project on your VPS and then run `./start.sh`

### SCP

These commands assume you have Nix installed and are running them from inside the dev environment.
If you don't want to install Nix to deploy, then you can look at the `/server/env.nix` file to see the aliased commands and use them directly.
  
Locally from project root:
1. Run `cap:prod:build`
2. Run `cap:prod:send`
   - You will need to edit `/server/env.nix` to reflect the server IP if it's different
   - This assumes that you have your ssh key in `~/.ssh/cap_key.pem`

On the VPS (home directory):
1. Run `sudo docker load -i ./cap-image.tar;sudo docker run -d -p 80:80 --name cap-container cap`
2. Test the server by running `curl localhost/ping`