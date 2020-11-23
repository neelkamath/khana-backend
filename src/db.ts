import {Db, MongoClient, ObjectId} from 'mongodb';
import CryptoJS from 'crypto-js';
import {
    Account,
    FoodPoint,
    IncompleteOrder,
    IncompleteOrderItem,
    IncompleteOrders,
    Menu,
    MenuItem,
    NewOrder,
    NewOrderItem,
    OrderStatus,
    PlacedOrder,
    PlacedOrders,
    Role,
    UpdatedMenuItem
} from './api-models';
import {notifyMenuUpdate, notifyOrder, notifyOrderPickedUp, notifyOrderPrepared} from './ws-api';

export interface User {
    readonly id: string;
    readonly emailAddress: string;
    readonly role: Role;
}

let db: Db;

export async function setUpDb(): Promise<void> {
    if (db !== undefined) return;
    const client = new MongoClient(process.env.MONGO_URL!, {useUnifiedTopology: true});
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME);
}

export async function isExistentUserId(id: string): Promise<boolean> {
    return await db.collection('users').findOne({_id: new ObjectId(id)}) !== null;
}

export async function isRegisteredEmailAddress(emailAddress: string): Promise<boolean> {
    return await db.collection('users').findOne({emailAddress}) !== null;
}

export async function readUser(emailAddress: string): Promise<User> {
    const user = await db.collection('users').findOne({emailAddress});
    return {
        id: user._id,
        emailAddress: user.emailAddress,
        role: user.role,
    };
}

export async function isValidLogin(emailAddress: string, password: string): Promise<boolean> {
    const login = {emailAddress, passwordDigest: CryptoJS.SHA256(password).toString()};
    return await db.collection('users').findOne(login) !== null;
}

export async function createUser(account: Account): Promise<void> {
    await db.collection('users').insertOne({
        emailAddress: account.emailAddress,
        passwordDigest: CryptoJS.SHA256(account.password).toString(),
        role: account.role,
    });
}

export async function updateMenu(item: UpdatedMenuItem): Promise<void> {
    const collection = db.collection('items');
    const filter = {foodPoint: item.foodPoint, name: item.name};
    if (await collection.findOne(filter) === null) await db.collection('items').insertOne(item);
    else await db.collection('items').findOneAndReplace(filter, item);
    notifyMenuUpdate(item);
}

export async function readMenu(): Promise<Menu> {
    const data = await db.collection('items').find().toArray();
    const items = [];
    for (const item of data) {
        const id = item._id;
        delete item._id;
        item.id = id;
        items.push(item);
    }
    return {items};
}

/** Returns `false` if either the `itemId` doesn't exist in the `foodPoint`, or there's fewer than `quantity`. */
export async function canOrder(foodPoint: FoodPoint, itemId: string, quantity: number): Promise<boolean> {
    const result = await db.collection('items').findOne({foodPoint, _id: new ObjectId(itemId)});
    return result !== null && result.quantity >= quantity;
}

/** The `userId` is the `_id` field of the user placing the `order` from the `users` collection. Returns order ID. */
export async function order(userId: string, order: NewOrder): Promise<string> {
    const insertion = await db
        .collection('orders')
        .insertOne({userId, status: 'PREPARING', foodPoint: order.foodPoint, items: order.items});
    for (const item of order.items) {
        const filter = {_id: new ObjectId(item.id)};
        const doc = await db.collection('items').findOne(filter);
        await db.collection('items').updateOne(filter, {$set: {quantity: doc.quantity - item.quantity}});
    }
    const orderId = insertion.insertedId;
    notifyOrder(userId, orderId, order);
    return orderId;
}

/** The `userId` is the `_id` field of the user in the `users` collection. */
export async function readOrders(userId: string): Promise<PlacedOrders> {
    const orders = await db.collection('orders').find({userId}).toArray();
    const placedOrders: PlacedOrder[] = [];
    for (const order of orders) {
        let price = 0;
        const items = order.items.map(async (item: MenuItem) => {
            const doc = await db.collection('items').findOne({_id: new ObjectId(item.id)});
            price += doc.price * item.quantity;
            return {quantity: item.quantity, price: doc.price, name: doc.name};
        });
        placedOrders.push({
            token: order._id,
            status: order.status,
            foodPoint: order.foodPoint,
            items: await Promise.all(items),
            price,
        });
    }
    return {orders: placedOrders};
}

/** Whether there's an order in the `orders` collection having the `_id` field as `orderId`. */
export async function isExistentOrder(orderId: string): Promise<boolean> {
    return await db.collection('orders').findOne({_id: new ObjectId(orderId)}) !== null;
}

/** The `orderId` is the value of the order's `_id` field in the `orders` collection. */
export async function readOrderStatus(orderId: string): Promise<OrderStatus> {
    const order = await db.collection('orders').findOne({_id: new ObjectId(orderId)});
    return order.status;
}

/** Sets the order status of the `orderId` to `'PREPARED'`. */
export async function prepareOrder(orderId: string): Promise<void> {
    await db.collection('orders').updateOne({_id: new ObjectId(orderId)}, {$set: {status: 'PREPARED'}});
    notifyOrderPrepared(orderId);
}

/** Sets the `orderId`'s `status` to `"PICKED_UP"` in the `orders` collection. */
export async function pickUpOrder(orderId: string): Promise<void> {
    await db.collection('orders').updateOne({_id: new ObjectId(orderId)}, {$set: {status: 'PICKED_UP'}});
    notifyOrderPickedUp(orderId);
}

export async function readIncompleteOrders(foodPoint: FoodPoint): Promise<IncompleteOrders> {
    const orders = await db
        .collection('orders')
        .find({foodPoint, $or: [{status: 'PREPARING'}, {status: 'PREPARED'}]})
        .toArray();
    const incompleteOrders: IncompleteOrder[] = [];
    for (const incompleteOrder of orders) {
        let price = 0;
        const asyncItems = incompleteOrder.items.map(async (item: NewOrderItem) => {
            const doc = await db.collection('items').findOne({_id: new ObjectId(item.id)});
            price += item.quantity * doc.price;
            return {name: doc.name, quantity: item.quantity};
        });
        const items: IncompleteOrderItem[] = await Promise.all(asyncItems);
        incompleteOrders.push({token: incompleteOrder._id, status: incompleteOrder.status, price, items});
    }
    return {orders: incompleteOrders};
}
