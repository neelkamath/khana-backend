import express from 'express';
import bodyParser from 'body-parser';
import {
    canOrder,
    createUser,
    isExistentOrder,
    isExistentUserId,
    isRegisteredEmailAddress,
    isValidLogin,
    order,
    pickUpOrder,
    prepareOrder,
    readIncompleteOrders,
    readMenu,
    readOrders,
    readOrderStatus,
    readUser,
    setUpDb,
    updateMenu
} from './db';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import {FoodPoint, Role} from './api-models';

setUpDb().catch(console.error);
const jwtHandler = expressJwt({secret: process.env.JWT_SECRET!, algorithms: ['HS256']});
const app = express();
app.use(bodyParser.json());
const port = 3000;
app.listen(port, () => console.info(`Listening on http://localhost:${port}`));

app.post('/create-account', async (request, response) => {
    if (await isRegisteredEmailAddress(request.body.emailAddress))
        response.status(400).send({reason: 'EXISTENT_EMAIL_ADDRESS'});
    else if (request.body.password.trim().length === 0) response.status(400).send({reason: 'INVALID_PASSWORD'});
    else {
        await createUser(request.body);
        response.sendStatus(204);
    }
});

app.post('/request-access-token', async (request, response) => {
    if (!await isRegisteredEmailAddress(request.body.emailAddress))
        response.status(400).send({reason: 'UNREGISTERED_EMAIL_ADDRESS'});
    else if (!await isValidLogin(request.body.emailAddress, request.body.password))
        response.status(400).send({reason: 'INCORRECT_PASSWORD'});
    else {
        const {id, role} = await readUser(request.body.emailAddress);
        response.send(buildAccessToken(id, role));
    }
});

app.post('/update-menu', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'cook') response.sendStatus(401);
    else {
        await updateMenu(request.body);
        response.sendStatus(204);
    }
});

app.get('/read-menu', async (_request, response) => response.send(await readMenu()));

app.post('/order', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'student') {
        response.sendStatus(401);
        return;
    }
    if (!isValidFoodPoint(request.body.foodPoint)) {
        response.status(400).send({reason: 'NONEXISTENT_FOOD_POINT'});
        return;
    }
    for (const item of request.body.items)
        if (!await canOrder(request.body.foodPoint, item.id, item.quantity)) {
            response.status(400).send({reason: 'INVALID_ITEM'});
            return;
        }
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    const token = await order(request.user.userId, request.body);
    response.send({token});
});

app.get('/orders', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'student' || !await isExistentUserId(request.user.userId)) response.sendStatus(401);
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    else response.send(await readOrders(request.user.userId));
});

app.post('/prepare-order', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'cook') {
        response.sendStatus(401);
        return;
    }
    const orderId = request.query['order-id'] as string;
    if (!await isExistentOrder(orderId) || await readOrderStatus(orderId) !== 'PREPARING') response.sendStatus(400);
    else {
        await prepareOrder(orderId);
        response.sendStatus(204);
    }
});

app.post('/pick-up-order', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'cook') {
        response.sendStatus(401);
        return;
    }
    const orderId = request.query['order-id'] as string;
    if (!await isExistentOrder(orderId) || await readOrderStatus(orderId) !== 'PREPARED') response.sendStatus(400);
    else {
        await pickUpOrder(orderId);
        response.sendStatus(204);
    }
});

app.post('/incomplete-orders', jwtHandler, async (request, response) => {
    // @ts-ignore: Property 'user' does not exist on type 'Request'.
    if (request.user.role !== 'cook') {
        response.sendStatus(401);
        return;
    }
    const foodPoint = request.query['food-point'] as FoodPoint;
    if (!isValidFoodPoint(foodPoint)) response.sendStatus(400);
    else response.send(await readIncompleteOrders(foodPoint));
});

/**
 * @param userId The `_id` field of the user in the MongoDB doc.
 * @param role The user's permission level.
 */
function buildAccessToken(userId: string, role: Role): string {
    return jwt.sign({userId, role}, process.env.JWT_SECRET!, {expiresIn: '1h'});
}

function isValidFoodPoint(foodPoint: string): boolean {
    return ['APU', 'Engineering Block', 'Breakfast and Snacks Food Bus', 'Lunch Food Bus'].indexOf(foodPoint) !== -1;
}