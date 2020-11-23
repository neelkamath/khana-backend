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
    updateMenu
} from './db';
import {FoodPoint} from './api-models';
import {buildAccessToken, jwtHandler} from './jwt';
import {Express} from 'express';

export function setUpHttpApi(app: Express): void {
    setUpCreateAccount(app);
    setUpRequestAccessToken(app);
    setUpUpdateMenu(app);
    setUpReadMenu(app);
    setUpOrder(app);
    setUpOrders(app);
    setUpPrepareOrder(app);
    setUpPickUpOrder(app);
    setUpIncompleteOrders(app);
}

function setUpCreateAccount(app: Express): void {
    app.post('/create-account', async (request, response) => {
        if (await isRegisteredEmailAddress(request.body.emailAddress))
            response.status(400).send({reason: 'EXISTENT_EMAIL_ADDRESS'});
        else if (request.body.password.trim().length === 0) response.status(400).send({reason: 'INVALID_PASSWORD'});
        else {
            await createUser(request.body);
            response.sendStatus(204);
        }
    });
}

function setUpRequestAccessToken(app: Express): void {
    app.post('/request-access-token', async (request, response) => {
        if (!await isRegisteredEmailAddress(request.body.emailAddress))
            response.status(400).send({reason: 'UNREGISTERED_EMAIL_ADDRESS'});
        else if (!await isValidLogin(request.body.emailAddress, request.body.password))
            response.status(400).send({reason: 'INCORRECT_PASSWORD'});
        else {
            const {id, role} = await readUser(request.body.emailAddress);
            response.send({accessToken: buildAccessToken(id, role)});
        }
    });
}

function setUpUpdateMenu(app: Express): void {
    app.post('/update-menu', jwtHandler, async (request, response) => {
        // @ts-ignore: Property 'user' does not exist on type 'Request'.
        if (request.user.role !== 'cook') response.sendStatus(401);
        else {
            await updateMenu(request.body);
            response.sendStatus(204);
        }
    });
}

function setUpReadMenu(app: Express): void {
    app.get('/read-menu', async (_request, response) => response.send(await readMenu()));
}

function setUpOrder(app: Express): void {
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
}

function setUpOrders(app: Express): void {
    app.get('/orders', jwtHandler, async (request, response) => {
        // @ts-ignore: Property 'user' does not exist on type 'Request'.
        if (request.user.role !== 'student' || !await isExistentUserId(request.user.userId)) response.sendStatus(401);
        // @ts-ignore: Property 'user' does not exist on type 'Request'.
        else response.send(await readOrders(request.user.userId));
    });
}

function setUpPrepareOrder(app: Express): void {
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
}

function setUpPickUpOrder(app: Express): void {
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
}

function setUpIncompleteOrders(app: Express): void {
    app.get('/incomplete-orders', jwtHandler, async (request, response) => {
        // @ts-ignore: Property 'user' does not exist on type 'Request'.
        if (request.user.role !== 'cook') {
            response.sendStatus(401);
            return;
        }
        const foodPoint = request.query['food-point'] as FoodPoint;
        if (!isValidFoodPoint(foodPoint)) response.sendStatus(400);
        else response.send(await readIncompleteOrders(foodPoint));
    });
}

function isValidFoodPoint(foodPoint: string): boolean {
    return ['APU', 'Engineering Block', 'Breakfast and Snacks Food Bus', 'Lunch Food Bus'].indexOf(foodPoint) !== -1;
}
