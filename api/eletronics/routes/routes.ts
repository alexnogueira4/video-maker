import Controller from '../controllers/controller'

class Routes {
	protected Controller: Controller;
	protected App: any;
	protected Router: any;
	protected MainRoute: string = '/eletronics'

	constructor (app:any, controller: Controller) {
		this.App = app;
		this.Controller = controller
	}

	init() {
		this.App.get(this.MainRoute + '/getAll', (req: any, res: any) => this.Controller.getAll(req, res))
		this.App.get(this.MainRoute + '/GetById/:eletronicId', (req: any, res: any) => this.Controller.get(req, res))
		this.App.post(this.MainRoute + '/create', (req: any, res: any) => this.Controller.set(req, res))
		this.App.delete(this.MainRoute + '/delete/:eletronicId', (req: any, res: any) => this.Controller.delete(req, res))
	}
}

export default Routes