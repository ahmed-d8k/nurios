with (import (fetchTarball https://github.com/nixos/nixpkgs/archive/nixpkgs-unstable.tar.gz) {allowUnfree = true;});
let
  pythonEnv = python310.withPackages (ps: [
    ps.fastapi
    ps.uvicorn
    ps.httpx
    ps.pytest
    ps.websockets
    ps.python-dotenv
    ps.aiohttp
    ps.pip # pip is only used for azure-cosmos since there's an issue with installing it via nixpkgs
  ]);
in mkShell {
  name = "python-shell";
  packages = [
    pythonEnv
    jetbrains.pycharm-professional
  ];
  shellHook = ''
    export PIP_PREFIX=$(pwd)/_build/pip_packages
    export PYTHONPATH="$PIP_PREFIX/${pkgs.python310.sitePackages}:$PYTHONPATH"
    export PATH="$PIP_PREFIX/bin:$PATH"
    unset SOURCE_DATE_EPOCH

    pip install --pre azure-cosmos

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