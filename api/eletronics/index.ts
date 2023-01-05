import Controller from './controllers/controller'
import Routes from './routes/routes'

class Rooms {
	protected App: any;
	protected database: any;
	protected controller:Controller;
	protected Routes: any;

	constructor(app:any, database: any) {
		this.App = app;
		this.database = database
		this.controller = new Controller(this.database)
		
		// initiate routes
		this.Routes = new Routes(this.App, this.controller)
		this.Routes.init()
	}
}

export default Rooms