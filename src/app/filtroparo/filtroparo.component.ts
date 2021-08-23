import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

import {MatDatepicker} from '@angular/material/datepicker';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
    
import {Moment} from 'moment';

const moment = _moment;
// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-filtroparo',
  templateUrl: './filtroparo.component.html',
  styleUrls: ['./filtroparo.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class FiltroparoComponent implements OnInit {

  @ViewChild("lstC0", { static: false }) lstC0: MatSelect;
  

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.datos.ano = normalizedMonth.year();
    this.datos.mes = normalizedMonth.month() + 1;
    datepicker.close();
    this.datos.fecha = !this.datos.ano ? new Date() : new Date(this.datos.ano + "/" + this.datos.mes + "/01"); 
  }

  @ViewChild("txtNotas", { static: false }) txtNotas: ElementRef;

  conceptos = [];
  areas = [];
  movil: boolean = false;
  validar01: boolean = false;
  validar02: boolean = false;
  validar03: boolean = false;
  tipoResumen: string = "";

  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<FiltroparoComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    
  }

  ngOnInit() {
    this.carrusel();
  }

  carrusel()
 {
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 45 AND estatus = 'A' ORDER BY nombre;"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      
      if (resp.length > 0)
      {
        this.conceptos = resp;
      }
      this.conceptos.splice(0, 0, {id: -1, nombre: this.servicio.rTraduccion()[297]})
      this.conceptos.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[298]})
    });
    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 145 AND estatus = 'A' ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.areas = resp;
      }
      this.areas.splice(0, 0, {id: -1, nombre: this.servicio.rTraduccion()[299]})
      this.areas.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[300]})
    })

    let miFecha = new Date(this.servicio.rFParo().ano + "/" + this.servicio.rFParo().mes + "/01");

    if (!miFecha)
    {
      miFecha = new Date(); 
    }
    this.datos.fecha = miFecha;
    
    this.datos.mes = miFecha.getMonth() + 1;
    this.datos.ano = miFecha.getFullYear() ;

    this.datos.clase = this.servicio.rFParo().clase;
    this.datos.area = this.servicio.rFParo().area;
    this.datos.concepto = this.servicio.rFParo().concepto;
    this.datos.descripcion = this.servicio.rFParo().cadena;
  }


  quitarFiltro()
  {
    this.servicio.aFParo({mes: this.servicio.fecha(1, "", "MM"), ano: this.servicio.fecha(1, "", "yyyy"), concepto: -1, clase: "-1", area: 0, cadena: "" });
    
    let miFecha = new Date(this.servicio.rFParo().ano + "/" + this.servicio.rFParo().mes + "/01");

    if (!miFecha)
    {
      miFecha = new Date(); 
    }
    this.datos.fecha = miFecha;
    
    this.datos.mes = miFecha.getMonth() + 1;
    this.datos.ano = miFecha.getFullYear() ;

    this.datos.clase = this.servicio.rFParo().clase;
    this.datos.area = this.servicio.rFParo().area;
    this.datos.concepto = this.servicio.rFParo().concepto;
    this.datos.descripcion = this.servicio.rFParo().cadena;

    this.lstC0.focus();
  }

  validar(id: number)
  {
    let miFecha = new Date(this.datos.fecha);

    if (!miFecha)
    {
      miFecha = new Date(); 
    }
    this.datos.mes = miFecha.getMonth() + 1;
    this.datos.ano = miFecha.getFullYear() ; 
    if (id == 1)
    {
      this.servicio.aFParo({mes: this.datos.mes, ano: this.datos.ano, clase: this.datos.clase, concepto: this.datos.concepto, area: this.datos.area , cadena: this.datos.descripcion})
    }
    this.datos.accion = id;
    this.dialogRef.close(this.datos);
  }

  


}


