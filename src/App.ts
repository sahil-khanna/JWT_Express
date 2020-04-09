import * as express from 'express';
import * as bodyParser from 'body-parser';
import { dbHelper } from './Helper/DBHelper';
import * as expressValidator from 'express-validator';
import { TokenController } from './Controllers/TokenController';

// Creates and configures an ExpressJS web server.
class App {

	// ref to Express instance
	public express: express.Application;

	//Run configuration methods on the Express instance.
	constructor() {
		this.express = express();
		dbHelper.connect()
		this.middleware();
		this.routes();
	}

	// Configure Express middleware.
	private middleware(): void {
		this.express.use(bodyParser.json({ limit: '50mb' }));
		this.express.use(bodyParser.urlencoded({ extended: false }));
		this.express.use(expressValidator());
	}

	// Configure API endpoints.
	private routes(): void {
		const app = this.express;

		// Allow access from all origins. NOT TO BE USED IN PRODUCTION CODE
		app.use(function(request, response, next) {
			response.header("Access-Control-Allow-Origin", "*");
			response.header("Access-Control-Allow-Headers", "*");
			response.header("Access-Control-Allow-Methods", "*");
			next();
		});

		const URL_PREFIX = '/api/1.0/';
		app.post(URL_PREFIX + 'token', new TokenController().generate);
		app.put(URL_PREFIX + 'token', new TokenController().update);
		app.get(URL_PREFIX + 'token', new TokenController().get);
		app.delete(URL_PREFIX + 'token', new TokenController().delete);
		app.get(URL_PREFIX + 'validate', new TokenController().validate);
	}
}

export default new App().express;