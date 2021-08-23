import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

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
  selector: 'app-filtrorechazo',
  templateUrl: './filtrorechazo.component.html',
  styleUrls: ['./filtrorechazo.component.css'],
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

export class FiltrorechazoComponent implements OnInit {

  @ViewChild("lstC0", { static: false }) lstC0: MatSelect;

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.datos.ano = normalizedMonth.year();
    this.datos.mes = normalizedMonth.month() + 1;
    datepicker.close();
    this.datos.fecha = !this.datos.ano ? new Date() : new Date(this.datos.ano + "/" + this.datos.mes + "/01"); 
  }

  @ViewChild("txtNotas", { static: false }) txtNotas: ElementRef;

  maquinas = [];
  conceptos = [];
  productos = [];

  movil: boolean = false;
  validar01: boolean = false;
  validar02: boolean = false;
  validar03: boolean = false;
  tipoResumen: string = "";

  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<FiltrorechazoComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    
  }

  ngOnInit() {
    this.carrusel();
  }

  carrusel()
 {
    let sentencia = "SELECT a.id, CASE WHEN ISNULL(b.nombre) THEN a.nombre ELSE CONCAT(a.nombre, ' / ',  b.nombre) END AS nombre FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id ORDER BY nombre"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      
      if (resp.length > 0)
      {
        this.maquinas = resp;
      }
    });
    
    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_partes ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.productos = resp;
      }
    })

    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 105 ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.conceptos = resp;
      }
    })

    let miFecha = new Date(this.servicio.rFRechazo().ano + "/" + this.servicio.rFRechazo().mes + "/01");

    if (!miFecha)
    {
      miFecha = new Date(); 
    }
    this.datos.fecha = miFecha;
    
    this.datos.mes = miFecha.getMonth() + 1;
    this.datos.ano = miFecha.getFullYear() ;
    
    this.datos.mes = this.datos.fecha.getMonth();
    this.datos.ano = this.datos.fecha.getYear(); 
    this.datos.producto = this.servicio.rFRechazo().producto;
    this.datos.maquina = this.servicio.rFRechazo().maquina;
    this.datos.clasificacion = this.servicio.rFRechazo().clasificacion;

  }

  quitarFiltro()
  {

        
    this.servicio.aFRechazo({mes: this.servicio.fecha(1, "", "MM"), ano: this.servicio.fecha(1, "", "yyyy"), clasificacion: "-1", producto: "-1", maquina: "-1" });

    let miFecha = new Date(this.servicio.rFRechazo().ano + "/" + this.servicio.rFRechazo().mes + "/01");

    if (!miFecha)
    {
      miFecha = new Date(); 
    }
    this.datos.fecha = miFecha;
    
    this.datos.mes = miFecha.getMonth() + 1;
    this.datos.ano = miFecha.getFullYear() ;
    
    this.datos.mes = this.datos.fecha.getMonth();
    this.datos.ano = this.datos.fecha.getYear(); 
    this.datos.producto = this.servicio.rFRechazo().producto;
    this.datos.maquina = this.servicio.rFRechazo().maquina;
    this.datos.clasificacion = this.servicio.rFRechazo().clasificacion;
    
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
      this.servicio.aFRechazo({mes: this.datos.mes, ano: this.datos.ano, maquina: this.datos.maquina, producto: this.datos.producto, clasificacion: this.datos.clasificacion })
    
    }
    this.datos.accion = id;
    this.dialogRef.close(this.datos);
  }

  
  


}



