# Contributing

## Installation

1. Install [node.js](https://nodejs.org/en/download/).
1. Install [Docker](https://docs.docker.com/get-docker/).
1. Clone the repo using one of the following methods:
    - SSH: `git clone git@github.com:neelkamath/khana-backend.git`
    - HTTPS: `git clone https://github.com/neelkamath/khana-backend.git`
1. `cd khana-backend`
1. Copy the [example `.env`](docs/.env) file to the project's root directory, and change the value of `JWT_SECRET`.
1. `npm i`

## Usage

Run the server on http://localhost: `docker-compose up -d`

To shut down: `docker-compose down`

## Spec

- Lint: `npm run lint`
- View rendered docs: `npm run serve-docs`

## DB

The DB has three collections: `users`, `items` and `orders`.

Here's an example document in the `users` collection:
```json5
{
  "_id": "k8j91f77bcf86cd7994356sg",
  "emailAddress": "neelkamathonline@gmail.com",
  "passwordDigest": "CRRaXNzhW5q7cxaSENSAHog5HomgWSiVS6eBLT8Gn9xCMVG6urbHuXkb7nbiUJRw",
  "role": "student" // <"student"> or <"cook">
}
```

Here's an example document in the `items` collection:
```json5
{
  "_id": "507f1f77bcf86cd799439011",
  "foodPoint": "APU", // <"APU">, <"Engineering Block">, <"Breakfast and Snacks Food Bus">, or <"Lunch Food Bus">
  "name": "Mexican sandwich",
  "picUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2106&q=80", // Optional; pic's URL
  "quantity": 50, // Optional
  "price": 25.50 // Rupees
}
```

Here's an example document in the `orders` collection:
```json5
{
  "_id": "8udj1f77bcf86cd799439i23", // Used as the token; will be shown as a QR code on the frontend UI
  "userId": "783u1f77bcf86cd799436755", // The <_id> field of the user who placed the order from the <users> collection
  "status": "PREPARED", // <"PREPARING">, <"PREPARED">, or <"PICKED_UP">
  "foodPoint": "APU",
  "items": [
    {
      "id": "507f1f77bcf86cd799439011", // The <_id> field from the <items> collection
      "quantity": 2
    }
  ]
}
```
