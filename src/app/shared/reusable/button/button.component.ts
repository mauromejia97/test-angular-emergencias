import { Component, Input, OnInit } from '@angular/core';
import { data } from 'src/app/main/interface/busqueda.interface';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  @Input() data!:data
  @Input() title1!:string
  @Input() title2!:string
  
  constructor() { }



  ngOnInit(): void {
  }
  switchState(d: any) {

		if (d.gcbaLicenseStatus == "REJECTED") {
			d.gcbaLicenseStatus = "ENTERED"
		} else {
			d.gcbaLicenseStatus = "REJECTED"
		}
	}
}
