import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import configureRoutes from './src/http/routes';

const app: Express = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json()).use(cors());

configureRoutes(app);

app.listen(PORT, () => console.log(`server is listening to port ${PORT}`));
