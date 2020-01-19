import { Router, Request, Response } from 'express';
// import * as path from 'path';
import * as express from 'express';
// import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
// import { MongoClient } from 'mongodb';
// import { Mongoose } from 'mongoose';
// import { UserController } from './controllers/UserController';
// import { Constants } from './helper/Constants';
// import { User, IUser, IUserModel } from './schema/User';
// import { Promise } from 'bluebird';
import { dbHelper } from './Helper/DBHelper';
// import { VendorController } from './controllers/VendorController';
// import { Validator } from 'express-validator';
import * as expressValidator from 'express-validator';
import { TokenController } from './Controllers/TokenController';
// import { OfferController } from './controllers/OfferController';

// Creates and configures an ExpressJS web server.
class App {

	// ref to Express instance
	public express: express.Application;

	//Run configuration methods on the Express instance.
	constructor() {
		this.express = express();
		dbHelper.connect()
		// .then(() => {
			this.middleware();
			this.routes();
		// });
	}

	// Configure Express middleware.
	private middleware(): void {
		// this.express.use(logger('dev'));
		this.express.use(bodyParser.json({ limit: '50mb' }));
		this.express.use(bodyParser.urlencoded({ extended: false }));
		this.express.use(expressValidator());
		// this.express.use(expressValidator({
		// 	customValidators: {
		// 	}
		// }));
	}

	// Configure API endpoints.
	private routes(): void {
		const urlPrefix: String = '/api/1.0/';
		const app = this.express;

		app.post(urlPrefix + 'token', new TokenController().generate);
		app.put(urlPrefix + 'token', new TokenController().update);
		app.post(urlPrefix + 'token', new TokenController().get);
		// app.post(urlPrefix + 'register', new UserController().register);
		// app.put(urlPrefix + 'profile', new UserController().profile);
		// app.get(urlPrefix + 'activate-account/*', new UserController().activateAccount);
		// app.get(urlPrefix + 'forgot-password/*', new UserController().forgotPassword);
		// app.put(urlPrefix + 'reset-password', new UserController().resetPassword);
		// app.get(urlPrefix + 'logout', new UserController().logout);
		// app.post(urlPrefix + 'vendors', new VendorController().add);
		// app.put(urlPrefix + 'vendors', new VendorController().update);
		// app.get(urlPrefix + 'vendors/*', new VendorController().list);
		// app.delete(urlPrefix + 'vendors/*', new VendorController().delete);
		// app.post(urlPrefix + 'offers', new OfferController().add);
		// // app.put(urlPrefix + 'offers', new OfferController().update);
		// app.get(urlPrefix + 'offers/*', new OfferController().list);
		// // app.delete(urlPrefix + 'offers/*', new OfferController().delete);

		// app.get('/resources/uploads/*', function (req: Request, res: Response) {
		// 	const split = __dirname.split('/');
		// 	delete split[split.length - 1];
		// 	res.sendFile(split.join('/') + Constants.FILE_UPLOAD_PATH + req.params['0']);
		// });
	}
}

export default new App().express;