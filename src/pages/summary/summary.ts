import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { AngularFireList, AngularFireDatabase,AngularFireObject } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'page-summary',
	templateUrl: 'summary.html',
})
export class SummaryPage {

	@ViewChild('lineCanvas') lineCanvas;
	@ViewChild('barCanvas') barCanvas;
	@ViewChild('doughnutCanvas') doughnutCanvas;
	lineChart: any;
	barChart: any;
	doughnutChart: any;
	public temp: Observable<any>;

	constructor(public navCtrl: NavController, public afd: AngularFireDatabase,public afAuth: AngularFireAuth) {

	}

	ionViewDidLoad() {
		this.afAuth.authState.subscribe((user: firebase.User) => {
			var userId=user.uid;
			var dataLoc="user/"+userId+"/report";			
			this.temp = this.afd.object(dataLoc).valueChanges().map(j =>{
				var arr = [];
				var data_arr = [];
				for(var k=1; k<Object.keys(j).length; k++){
					try{
						arr.push(j[k].date);
						data_arr.push(j[k].level);
						k++;
					}
					catch(error){
						break;
					}
				}
				
				Chart.defaults.global.legend.display = true;
				this.lineChart = new Chart(this.lineCanvas.nativeElement, {

					type: 'line',
					data: {
						labels: arr,
						datasets: [
						{
							label: "Contamination Values",
							display:false,
							fill: false,
							lineTension: 0.1,
							backgroundColor: "rgba(75,192,192,0.4)",
							borderColor: "rgba(75,192,192,1)",
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: "rgba(75,192,192,1)",
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: "rgba(75,192,192,1)",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: data_arr,
							spanGaps: false,
						}
						]

					},
					options: {
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								},
								scaleLabel: {
									display: true,
									labelString: 'Contamination Level',
									fontColor : '#FF0000',
									fontSize:10
								},
								stacked: true
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Date',
									fontColor: '#FF0000',
								}
							}]
						}
					}
				});


				var year = new Date().getFullYear();
				var monthData = [0,0,0,0,0,0,0,0,0,0,0,0];
				var monthAmt = [0,0,0,0,0,0,0,0,0,0,0,0];
				for(var k=1; k<Object.keys(j).length; k++){
					if((j[k].date.split("/"))[2]==year){
						monthData[parseInt((j[k].date.split("/"))[1])-1] += j[k].level;
						monthAmt[parseInt((j[k].date.split("/"))[1])-1]++;
					}
				}

				for(var i in monthData){
					if(monthAmt[i]!=0)
						monthData[i]=monthData[i]/monthAmt[i];
					else
						monthData[i]=0;
				}

				var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

				this.barChart = new Chart(this.barCanvas.nativeElement, {
					type: 'bar',
					data: {
						labels: months,
						datasets: [
						{
							label: "Average % Per Month",
							display:false,
							fill: false,
							lineTension: 0.1,
							backgroundColor: "rgba(75,192,192,0.4)",
							borderColor: "rgba(75,192,192,1)",
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: "rgba(75,192,192,1)",
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: "rgba(75,192,192,1)",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: monthData,
							spanGaps: false,
						}
						]

					},
					options: {
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								},
								scaleLabel: {
									display: true,
									labelString: 'Contamenent Level',
									fontColor : '#FF0000',
									fontSize:10
								},
								stacked: true
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Date',
									fontColor: '#FF0000',
								}
							}]
						}
					}
				});

				
				var colours = ["#D43939", "#382AC0", "#24B446", "#F7FF14", "#DD2DE3", "#E07738", "#6CCFF8", "#317400"];

				var devices = [];
				var maxs = [];
				for(var n in j){
					if(!devices.includes(j[n].location))
						devices.push(j[n].location);
				}

				for(var n in j){
					for(var p in devices){
						if(j[n].location==devices[p]){
							if(maxs[p]==null)
								maxs[p]=0;
							if(j[n].level > maxs[p])
								maxs[p]=j[n].level;
						}
					}
				}

				this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {

					type: 'doughnut',
					data: {
						labels: devices,
						datasets: [
						{
							data: maxs,
							backgroundColor: colours.slice(0,devices.length),
						}]
					}

				});
			});
		});
	}
}