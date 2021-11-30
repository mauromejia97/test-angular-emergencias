import { Component, OnInit,  } from '@angular/core';
import { data } from '../interface/busqueda.interface';
import { BusquedaService } from '../services/busqueda.service';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  dataLicence: data[] = []
  modalsw: boolean = false;
  public dataSelect: data[] = [];

  columns = [
    { headerName: 'Id', field: 'id' },
    { headerName: 'NOMBRE', field: 'name' },
    { headerName: 'APELLIDO', field: 'surname' },
    { headerName: 'CUIL', field: 'cuil' },
    { headerName: ' ID RH', field: 'tenant' },
    { headerName: 'LICENCIA', field: 'typeLicense' },
    { headerName: 'UNI. ORG.', field: 'workstation' },
    { headerName: 'CARGO', field: 'description' },
    { headerName: 'FECHA INICIO', field: 'initDate' },
    { headerName: 'FECHA FIN', field: 'endingDate' },
    { headerName: 'ESTADO', field: 'status' },
  ];



  constructor(private busquedaService: BusquedaService,) { }


  ngOnInit(): void {
    this.busquedaService.buscarSujeto().subscribe(r => {
      this.dataLicence = r.content;
    });
  }

  getDemo(e: any) {
    console.log(e);
  }

}
