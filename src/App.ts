import express from 'express';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import cors from 'cors';
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import dotEnv from 'dotenv'

import {Request, Response, NextFunction} from 'express'

dotEnv.config({
    path: `./env/development.env`
});

export default class Application {
    public app: express.Application;
    public port: number;
    public routers: any[];

    constructor(routers: any[], port: number) {
        this.app = express();
        this.port = port;
        this.routers = routers;

        this.initializeMiddleware();
        this.initializeRouters();
    }

    private initializeMiddleware() {
        this.app.disable('x-powered-by');

        this.app.use(helmet());
        this.app.use(cors({
            origin: '*',
            credentials: true
        }));
        this.app.use(compression({
            level: 9
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(cookieParser());
        this.app.use(morgan('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        // this.app.use(this.testMiddleware);
    }

    private initializeRouters() {
        for(const router of this.routers) {
            this.app.use(router.path, router.router);
        }
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`server started on port: ${this.port}`)
        });
    }

    private testMiddleware(request: Request, response:Response, next: NextFunction) {

    }
};
