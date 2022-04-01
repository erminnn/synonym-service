import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import router from './routes';
import errorMiddleware from './middleware/error-handler';

// Load .env variables
dotenv.config();
// Connect to database
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .catch((error) => {
        console.log(error);
        process.exit(-1);
    });

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(process.env.BASE_PATH, router);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));
