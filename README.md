## Architecture

[![](https://mermaid.ink/img/pako:eNpdUcFuwyAM_RXEKZGafQCTKk3ZcVGScSw9MHAX1AQiAp2qtv8-iLtq6gHJfn7PfsYXqpwGyuhhdD9qkD6Qj89XYYUlpCauqhy5cqeOEIhy1oIKxtkrL-4YB38CXyJ_iV_fXs4DaVLLMSOE8LemSK_MGVj9RKxHAzYgsy4w-0_NYUeqapv7PGlxNGq18egMza-DV1m_K_oIEco9Y0ydR2P1n6Yn1UtidEXnnYJlcb7EAg5sd9l3G8McQ7l_LJNqWYR5iy34vfowTjd0Aj9Jo9PHXjIsaBhgAkFZCrX0R0GFvSWejMHxs1WUBR9hQ-OsZYB3I9OSE2UHOS4JBW2C8w1eaj3Y7RdsfoqR?type=png)](https://mermaid.live/edit#pako:eNpdUcFuwyAM_RXEKZGafQCTKk3ZcVGScSw9MHAX1AQiAp2qtv8-iLtq6gHJfn7PfsYXqpwGyuhhdD9qkD6Qj89XYYUlpCauqhy5cqeOEIhy1oIKxtkrL-4YB38CXyJ_iV_fXs4DaVLLMSOE8LemSK_MGVj9RKxHAzYgsy4w-0_NYUeqapv7PGlxNGq18egMza-DV1m_K_oIEco9Y0ydR2P1n6Yn1UtidEXnnYJlcb7EAg5sd9l3G8McQ7l_LJNqWYR5iy34vfowTjd0Aj9Jo9PHXjIsaBhgAkFZCrX0R0GFvSWejMHxs1WUBR9hQ-OsZYB3I9OSE2UHOS4JBW2C8w1eaj3Y7RdsfoqR)

- Upon a socket request initializing with valid request data, a new record will be inserted in the container `Queue` in CosmosDB with a unique ID and the image will be downloaded locally
- `Processor` checks for new records to see if any should be processed
  - Items unprocessed will have their `status` property set to "processing" and then sent to the `SAM Model` to be processed for segmentation
  - When the data comes back from the `SAM Model` the data is stored in the `SAMOutput` container
- While any connections are active in the `Socket Server`, it'll actively read from the `Queue` db container for any records that have a status property of "processed"
  - It will then mark the status of these as "finished", reference the `SAMOutput` for the result data, and then send it back to the client while closing the connection.
- If a connection is closed before the process has completed, the item's status will be marked as "interrupted"

  - Items in the db container will have a uuid that will be used later

- DB Models
  - `Queue`
    - createdAt: `DateTime?`
    - processing: `DateTime?`
    - processed: `DateTime?`
    - finished: `DateTime?`
    - interrupted: `DateTime?`
    - boxes: `{x: int, y: int, width: int, height: int}`
    - uuid: `string`
  - `SAMOutput`
    - 

- DB Model Notes
  - processing, processed, finished, and interrupted are each set during the pipeline
  - if null, it means it hasn't reached that point
  - we can easily see where each record currently is or stopped by picking the value out of these 4 properties that is latest
    - there is a logical order where these should be before one another, so if this is ever out of sync then that gives an easy indication there's a bug
  - the id of each record doesn't have to be ordered, so we can use a uuid
    - since each request/record/image matches up to 1:1:1 we can use the same id for all 3

## Setup

First set the environment variables. You can see the variables to set in `.env.example`. Either set them in a `.env` file or set them in your shell.
For development, you only need Nix installed (no python, pip, IDE, or anything else required).
Once installed, run the shell script in `./env.sh` which will start a Nix shell  
  - Note: If you check the contents of this shell script, it's just running a single command. You can alias this locally if you want.   

When you start the Nix shell you'll be prompted with a message detailing aliased commands you can use. 

[Download the checkpoint](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth) and place it in the root of the server directory: `/server`
  - The model module will expect this file to be `/server/sam_vit_h_4b8939.pth`

## Deployment

Currently deployment is done manually. You can deploy via scp or via git, whichever you prefer.  
The server only really requires Docker. Other configurations (ufw, caddy, users, etc. ) aren't included in this setup guide.

**These commands assume you have Nix installed and are running them from inside the dev environment.**  
If you don't want to install Nix to deploy, then you can look at `./server/env.nix` to see the aliased commands and use them directly.  
    
Once you clone the project, locally from project root:  
1. Run `cap:prod:build`
2. Run `cap:prod:send`
   - You will need to edit `/server/env.nix` to reflect the server IP if it's different
   - This assumes that you have your ssh key in `~/.ssh/cap_key.pem`

On the VPS from home directory:  
1. Run `sudo docker load -i ./cap-image.tar`
2. Run this command, replacing the respective environment variables 
```
sudo docker run -d -p 8080:8080 \
-e COSMOS_ENDPOINT=<your endpoint>
-e COSMOS_KEY=<your key> \
--name cap-container cap
```
  - TODO: improve this process
3. Test the server by running `curl localhost/ping`