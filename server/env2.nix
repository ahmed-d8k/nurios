with (import (fetchTarball https://github.com/nixos/nixpkgs/archive/nixpkgs-unstable.tar.gz) {allowUnfree = true;});
let
  pkgs = import <nixpkgs> {};
  python = pkgs.python310;
  pythonPackages = python.pkgs;
in
mkShell {
  name = "pip-env";
  buildInputs = with pythonPackages; [
    # Python requirements (enough to get a virtualenv going).
    ipykernel
    jupyter
    pytest
    setuptools
    wheel
    venvShellHook

    libffi
    openssl
    gcc

    unzip

    jetbrains.pycharm-professional
    fastapi
    uvicorn
    httpx
    pytest
    websockets
    python-dotenv
    aiohttp
    pip
  ];
  venvDir = "venv37";
  src = null;
  postVenv = ''
    unset SOURCE_DATE_EPOCH
    pip install --pre azure-cosmos
  '';
  postShellHook = ''
    # Allow the use of wheels.
    unset SOURCE_DATE_EPOCH
    PYTHONPATH=$PWD/$venvDir/${python.sitePackages}:$PYTHONPATH
  '';
  shellHook = ''
    alias cap:dev="uvicorn server.main:app --port 8080 --reload"
    alias cap:prod="sudo docker build -t cap .;sudo docker run -d --name cap-container -p 80:80 cap"
    alias cap:prod:build="sudo docker build -t cap .;sudo docker save -o ./cap-image.tar cap"
    alias cap:prod:send="sudo chmod +r ./cap-image.tar;scp -i ~/.ssh/cap_key.pem -r ./cap-image.tar cap@20.253.238.231:~/cap-image.tar"
    alias cap:prod:run="sudo docker load -i ./cap-image.tar;sudo docker run -d -p 80:80 --name cap-container cap"
    alias pycharm="pycharm-professional . &>/dev/null &"


    echo "Starting python environment.
    See github for this project: https://github.com/ahmed-d8k/nurios

    Shortcuts:
        pycharm         =  opens pycharm in the current directory
        pytest          =  runs tests
        cap:dev         =  starts the dev server with hot reload (no docker required)
        cap:prod        =  starts the server with docker like prod (docker required)
        cap:prod:build  =  builds the server with a docker image and output it as a tarball
        cap:prod:send   =  sends the tarball to the VPS via scp
        cap:prod:run    =  starts the server from the tarball
    "
  '';
}
