import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { BusquedaResponse, data } from '../interface/busqueda.interface';


@Injectable({
  providedIn: 'root'
})
export class BusquedaService {

  private secretKey: string = "$2b$10$ULxnDsxE0lZNrZe6gPML/eFzpFQHH1DQjq90HzOkvtDum5mGBs1Ta";

  private uRLservice: string = "https://api.jsonbin.io/b/5f0887eb5d4af74b0129dd77"

  public result: data[] = [];

  constructor(private http: HttpClient) {

    this.result = JSON.parse(localStorage.getItem('resultado')!) || [];
  }




  buscarSujeto() {

    const params = new HttpHeaders({
      'secret-key': this.secretKey
    })

    return this.http.get<BusquedaResponse>(this.uRLservice, { headers: params })

  }
}
