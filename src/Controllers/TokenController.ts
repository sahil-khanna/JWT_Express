import { Request, Response } from 'express';
import { checkSchema } from 'express-validator/check';
import { Constants } from '../Helper/Constants';
import * as jsonwebtoken from 'jsonwebtoken';
import { dbHelper } from '../Helper/DBHelper';
import { Db } from 'mongodb';

export class TokenController {

    private JWT_PASSWORD = "NFjNQa4bA&rc%Sq";

    constructor() {
        this.generate = this.generate.bind(this);
    }

    public generate(request: Request, response: Response) {
        request.checkBody('issuer.clientEmail', Constants.INVALID_CLIENT_EMAIL).isEmail();
        request.checkBody('issuer.clientCompany', Constants.INVALID_CLIENT_COMPANY).isString();
        request.checkBody('issuer.providerEmail', Constants.INVALID_PROVIDER_EMAIL).isEmail();
        request.checkBody('authorizedURLs', Constants.INVALID_AUTHORIZED_URLS).isArray();

        let errors: any = request.validationErrors();

        if (errors !== false) {
			return response.json({
				code: -1,
				message: errors[0].msg
			});
        }

        dbHelper.db.collection("clients").insertOne(request.body)
        .then((_dbResult) => {
            console.log(_dbResult);
        })
        
        var token = jsonwebtoken.sign(request.body, this.JWT_PASSWORD, {
            expiresIn: Math.floor(Date.now() / 1000) + (60 * 60)
        });

        // var token = jsonwebtoken.sign({ foo: 'bar' }, 'shhhhh');
        // console.log(token);
        return response.json(request.body);
    }
}