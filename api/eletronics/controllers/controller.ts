import IEletronics from '../model/eletronics'
import gpio from 'rpi-gpio'

class Controller implements IEletronics {
	id?: string;
	GPIO: number;
	frequency: string;
	potentiometer: string;
	radio: boolean;
	switch: boolean
	voltage: string;
	watts: string;
	collection = 'eletronics'
	protected database: any;
	protected ISnapshot: any;

	constructor(database: any) {
		this.database = database.collection(this.collection)
		this.getAll('','')
	}

	public getAll(req: any, res: any): void {
		this.database
				.get()
				.then((snapshot: any) => {
					const results:any = []
					snapshot.forEach((doc:any) => {
						results.push({
							id: doc.id,
							...doc.data()
						});
					});
					if (!res){
						console.log('Eletronics services initialized!')
					} else {
						res.send(results)
					}
				})

		this.database
			.onSnapshot(querySnapshot => {
				querySnapshot.docChanges().forEach(change => {
					console.log(change);
					if (change.type === 'modified') {
						console.log('Modified eletronic: ', change.doc.data());
						this.switchState(change.doc.data())
					}
				});
			});
				
	}

	private switchState (eletronic: IEletronics | any) {
		gpio.setup(eletronic.GPIO, gpio.DIR_OUT, (err)=>{
			gpio.write(eletronic.GPIO, !eletronic.switch, function(err) {
				console.log(`PIN ${eletronic.GPIO} is ${eletronic.switch ? 'on' : 'off'} now`);
			});		
		});

	}

	public set(req:any, res:any) {
		let eletronic: IEletronics = { 
			GPIO: req.body.GPIO,
			frequency: req.body.frequency,
			potentiometer: req.body.potentiometer,
			radio: req.body.radio,
			switch: req.body.switch,
			voltage: req.body.voltage,
			watts: req.body.watts
		}

		this.database
				.doc()
				.set(eletronic)
				.then(() => {
					res.json({
						status: "Data saved successfully.",
						data: eletronic
					});
				})
				.catch(error => {
					res.send("Data could not be saved." + error);
				})
	}
	
	public get(req: any, res: any): void {
		const { eletronicId } = req.params
		
		this.database.doc(eletronicId)
				.get()
				.then((snapshot: any) => {
					res.send(snapshot.data())
				})
				.catch(error => {
					res.send("Some error occurred." + error);
				})
	}

	public delete(req: any, res: any): boolean {
		let { eletronicId } = req.params
		
		this.database
				.doc(eletronicId)
				.delete()
				.then(()=>{
					res.send("Data deleted successfully.");
				})
				.catch(error => {
					res.send("Data could not be deleted." + error);
				})

		return true
	}
}

export default Controller