import { MongoClient, Db, MongoError } from 'mongodb';
// import { User } from '../schema/User';

class DBHelper {

	public db: Db;

	public async connect() {
		try {
			const client = await MongoClient.connect('mongodb://localhost:27017');
			this.db = client.db('jwt');
			console.log('DB Connected');
		}
		catch (error) {
			console.log('DB Error: ' + error.message);
		}
	}
}

export const dbHelper = new DBHelper();
