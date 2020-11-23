# Khana Backend

[Khana](docs/explanation.md)'s backend API. Here's a [frontend UI](https://github.com/neelkamath/khana-frontend).

## Installation

1. Install [Docker](https://docs.docker.com/get-docker/).
1. Clone the repo using one of the following methods:
    - SSH: `git clone git@github.com:neelkamath/khana-backend.git`
    - HTTPS: `git clone https://github.com/neelkamath/khana-backend.git`
1. Copy the [example `.env`](docs/.env) file to the project's root directory, and change the value of `JWT_SECRET`.

## Usage

Read the [API docs](docs/api.md).

Run the server on http://localhost: `docker-compose up -d`

To shut down: `docker-compose down`

## [Contributing](docs/CONTRIBUTING.md)

## License

This project is under the [MIT License](LICENSE).
