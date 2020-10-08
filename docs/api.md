# API

## [HTTP API Docs](https://neelkamath.github.io/khana-backend)

## WebSocket API Docs

The WebSocket API allows you to receive live updates on ws://localhost/updates. All received messages are JSON serialized as text. The server will ignore any messages you send. Since every update gets sent to every client, you'll need to ignore messages which are irrelevant to the user (e.g., user _U1_ will receive the order updates of user _U2_ in addition to their own). Below are examples of the messages you will receive. Each message will have the field `"type"` which the frontend must use to handle the particular message type accordingly.

### Menu Updates

```json5
{
  "type": "MENU_UPDATE",
  "foodPoint": "APU", // One of <"APU">, <"Engineering Block">, <"Breakfast and Snacks Food Bus">, <"Lunch Food Bus">
  "name": "Mexican sandwich",
  "picUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2106&q=80", // Optional
  "quantity": 50, // How many left in stock
  "price": 25.5 // Price in INR
}
```

### Orders

```json5
{
  "type": "ORDER",
  "userId": "9oi89f80e7a8io98998bb760", // ID of the user who placed this order.
  "foodPoint": "APU", // One of <"APU">, <"Engineering Block">, <"Breakfast and Snacks Food Bus">, <"Lunch Food Bus">
  "items": [
    {
      "id": "5f7e9f80e7acf001998be5fd",
      "quantity": "1"
    }
  ]
}
```

### Order Prepared

```json5
{
  "type": "ORDER_PREPARED",
  "orderId": "5f7e9f80e7acf001998be5fd" // ID of the order which can now be picked up.
}
```

### Order Picked Up

```json5
{
  "type": "ORDER_PICKED_UP",
  "orderId": "5f7e9f80e7acf001998be5fd" // ID of the order which was just picked up.
}
```
