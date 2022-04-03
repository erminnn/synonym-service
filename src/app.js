import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes';
import errorMiddleware from './middleware/error-handler';

// Load .env variables
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(process.env.BASE_PATH, router);

app.use(errorMiddleware);

export default app;
