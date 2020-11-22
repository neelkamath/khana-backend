import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {setUpDb} from './db';
import {setUpHttpApi} from './http-api';
import {setUpWebSocketApi} from './ws-api';

setUpDb().catch(console.error);
const app = express().use(bodyParser.json());
app.use(cors());
setUpHttpApi(app);
setUpWebSocketApi(app);
