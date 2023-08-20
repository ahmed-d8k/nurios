## Setup

1. First set the environment variables. See `.env.example` as an example to set up the env file.  
2. [Download the checkpoint](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth) and place it in the root of the server directory: `/server`
- Full path from project root should be `/server/sam_vit_h_4b8939.pth`
3. For development a [Nix shell](https://cuddly-octo-palm-tree.com/posts/2021-12-19-tyska-nix-shell/) has been provided. It's optional, and you only need Nix installed to start developing without needing anything installed.
Once installed, run the shell script in `./env.sh` which will start a Nix shell.  
Alternatively you can set up your own dev environment. Use Python 3.10 and see `server/requirements.txt`
4. Change directory to `/client` and run `yarn run dev` for the client  
Change directory to `/server` and run `cap:dev` if using the Nix shell or run `uvicorn main:app --port 8080 --reload` without it

## Deployment

Automatic deployment to GH pages for the client and our own hosted VPS for the server is configured.  
If it's easier for you, you can view `server-deployment.yml`  
Re-enabling Docker for server deployment is planned.  
The rest of this is for those who are cloning and want to deploy independently.  

**These commands are alias' within the Nix shell above.   
If not using the Nix shell, check `server/env.nix` to see what the commands are aliased to.**  
    
From project root:  
1. Run `cap:prod:build`
2. Run `cap:prod:send`
   - You will need to edit `/server/env.nix` to reflect the server IP if it's different
   - This assumes that you have your ssh key in `~/.ssh/cap_key.pem` - rename it as necessary

On the VPS from home directory:  
1. Run `sudo docker load -i ./cap-image.tar`
2. Run this command, replacing the environment variables values to your own
```
sudo docker run -d -p 8080:8080 \
-e COSMOS_ENDPOINT=<your endpoint>
-e COSMOS_KEY=<your key> \
--name cap-container cap
```
3. Test the server by running `curl localhost/ping`