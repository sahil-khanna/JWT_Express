import { Request, Response } from 'express';
import { Constants } from '../Helper/Constants';
import * as jwt from 'jsonwebtoken';
import { dbHelper } from '../Helper/DBHelper';
import { ObjectID } from 'mongodb';

export class TokenController {

    private readonly JWT_PASSWORD = "NFjNQa4bA&rc%Sq";

    constructor() {
        this.generate = this.generate.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.validate = this.validate.bind(this);
    }

    public generate(request: Request, response: Response) {
        request.checkBody('issuer.clientEmail', Constants.INVALID_CLIENT_EMAIL).isEmail();
        request.checkBody('issuer.clientCompany', Constants.INVALID_CLIENT_COMPANY).isString();
        request.checkBody('issuer.providerEmail', Constants.INVALID_PROVIDER_EMAIL).isEmail();
        request.checkBody('expiresOn', Constants.INVALID_EXPIRY_DATE).isNumeric();
        request.checkBody('authorizedMethods', Constants.INVALID_AUTHORIZED_METHODS).isArray().notEmpty();

        let errors: any = request.validationErrors();

        if (errors !== false) {
			return response.json({
				code: -1,
				message: errors[0].msg
			});
        }

        // Generate JWT and save to DB along with its payload
        let objId = new ObjectID();        
        let token = jwt.sign({uid: objId}, this.JWT_PASSWORD);

        let payload = {
            _id: objId,
            token: token,
            data: {
                issuer: request.body["issuer"],
                authorizedMethods: request.body["authorizedMethods"],
                expiresOn: request.body["expiresOn"]
            },
            status: true
        }

        dbHelper.db.collection("clients").insertOne(payload)
        .then((_dbResult) => {
            return response.json({
                code: 0,
                data: {
                    token: token,
                    data: _dbResult.result
                }
            });
        })
        .catch((_error) => {
            return response.json({
                code: -100,
                message: _error.message
            });
        });
    }

    public update(request: Request, response: Response) {
        request.checkBody('authorizedMethods', Constants.INVALID_AUTHORIZED_METHODS).isArray().notEmpty();
        request.checkBody('status', Constants.INVALID_TOKEN_STATUS).isBoolean();
        request.checkBody('token', Constants.INVALID_TOKEN).isString();

        let errors: any = request.validationErrors();

        if (errors !== false) {
			return response.json({
				code: -1,
				message: errors[0].msg
			});
        }

        var tokenDetails = null;
        try {
            tokenDetails = jwt.verify(request.body['token'], this.JWT_PASSWORD);
        } catch(err) {
            return response.json({
                code: Constants.INVALID_TOKEN_CODE,
                message: Constants.INVALID_TOKEN
            });
        }

        // Update the existing record
        dbHelper.db.collection("clients").updateOne(
            {_id: new ObjectID(tokenDetails["uid"])},
            {$set: {
                status: request.body["status"],
                "data.authorizedMethods": request.body["authorizedMethods"],
                "data.expiresOn": request.body["expiresOn"]
            }})
        .then((_dbResult) => {
            return response.json({
                code: 0,
                message: Constants.RECORD_UPDATED,
                data: _dbResult.result
            });
        })
        .catch((_error) => {
            return response.json({
                code: -100,
                message: _error.message
            });
        });
    }

    public get(request: Request, response: Response) {
        // Update the existing record
        dbHelper.db.collection("clients").find().toArray()
        .then((entries) => {
            return response.json({
                code: 0,
                data: entries
            });
        })
        .catch((_error) => {
            return response.json({
                code: -100,
                message: _error.message
            });
        });
    }

    public delete(request: Request, response: Response) {
        request.checkBody('token', Constants.INVALID_TOKEN).isString();

        let errors: any = request.validationErrors();

        if (errors !== false) {
			return response.json({
				code: -1,
				message: errors[0].msg
			});
        }

        // Delete the existing record
        dbHelper.db.collection("clients").deleteOne(
            {token: request.body['token']}
        )
        .then((_dbResult) => {
            return response.json({
                code: 0,
                message: Constants.RECORD_DELETED,
                data: _dbResult.result
            });
        })
        .catch((_error) => {
            return response.json({
                code: -100,
                message: _error.message
            });
        });
    }

    public validate(request: Request, response: Response) {
        request.checkBody('token', Constants.UNAUTHORIZED_ACCESS).isString();
        request.checkBody('method', Constants.INVALID_METHOD).isString();
        request.checkBody('verb', Constants.INVALID_VERB).isString();

        let errors: any = request.validationErrors();

        if (errors !== false) {
			return response.json({
				code: -1,
				message: errors[0].msg
			});
        }

        let tokenDetails = null;
		try {
			tokenDetails = jwt.verify(request.body['token'], this.JWT_PASSWORD);
		} catch(err) {
			return response.json({
				code: Constants.UNAUTHORIZED_ACCESS_CODE,
				message: Constants.UNAUTHORIZED_ACCESS
			});
        }
        
        dbHelper.db.collection('clients').findOne(
            {
                _id: new ObjectID(tokenDetails["uid"]),
                status: true,
                "data.authorizedMethods": { $elemMatch: {
                    name: request.body['method'],
                    verbs: {$in: [request.body['verb']]}
                } },
            }
        )
        .catch((_error) => {
            return response.json({
                code: -100,
                message: _error.message
            });
        })
        .then((_dbResult) => {
            if (_dbResult) {
                return response.json({
                    code: 0,
                    message: Constants.AUTHORIZED_ACCESS
                });
            }
            else {
                return response.json({
                    code: Constants.UNAUTHORIZED_ACCESS_CODE,
                    message: Constants.UNAUTHORIZED_ACCESS
                });
            }
        });
    }
}