from ubuntu:20.04
EXPOSE 8000

WORKDIR /root
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y software-properties.common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install -y curl build-essential python3.8-dev python3.8-venv software-properties-common
RUN ln -s /usr/bin/python3.8 /usr/bin/python
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3.8 -
ENV PATH="${PATH}:/root/.poetry/bin"

# RUN apt-get install -y git mysql mysql-client
RUN apt-get install -y mysql-server
# RUN apt-get install -y jpeg-dev zlib-dev libjpeg  # For pillow
RUN apt-get install -y libxslt-dev  # For lxml
RUN apt-get install -y musl-dev libffi-dev   # For cryptography

ADD pyproject.toml .
ADD poetry.lock .
RUN apt-get install -y libmysqlclient-dev
RUN apt-get install -y git
RUN CRYPTOGRAPHY_DONT_BUILD_RUST=1 poetry install

ADD install_polyjuice.sh .
RUN poetry run ./install_polyjuice.sh

ADD backend backend
ADD backend_launch.sh .
CMD ./backend_launch.sh
