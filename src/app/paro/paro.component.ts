import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-paro',
  templateUrl: './paro.component.html',
  styleUrls: ['./paro.component.css']
})
export class ParoComponent implements OnInit {

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
    public dialogRef: MatDialogRef<ParoComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    
  }

  ngOnInit() {
    this.carrusel();
  }

  carrusel()
 {
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 45 AND url_mmcall = 'S' AND estatus = 'A' ORDER BY nombre;"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.conceptos = resp;
      }
    });
    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE estatus = 'A' AND tabla = 145 ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.areas = resp;
      }
    })

    if (this.datos.accion==0)
   {
    this.datos.finaliza_sensor = "S";
    this.datos.tiempo = "0";
    this.datos.paro = this.servicio.rTraduccion()[370]
    this.calcularHR(0);
    this.datos.notas = "";
   }
   else
   {
    let sentencia = "SELECT paro, area, tipo, notas, tiempo, finaliza_sensor FROM " + this.servicio.rBD() + ".detalleparos WHERE id = " + this.datos.accion;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.datos.finaliza_sensor = resp[0].finaliza_sensor;
        this.datos.tiempo = +this.datos.tiempo == 0 ? +resp[0].tiempo : +this.datos.tiempo;
        this.datos.paro = resp[0].paro;
        this.datos.notas = resp[0].notas;
        this.datos.area = resp[0].area;
        this.datos.concepto = resp[0].tipo;
        this.calcularHR(+this.datos.tiempo);
        setTimeout(() => {
          this.txtNotas.nativeElement.focus();
        }, 100);
      }
    });
    
   }


  }


  validar(id: number)
  {
    this.datos.accion = id;
    if (this.datos.notas == "null")
    {
      this.datos.notas = "";
    }
    if (this.datos.resultados == "null")
    {
      this.datos.resultados = "";
    }
    this.dialogRef.close(this.datos);
  }

  
  calcularHR(segundos: number)
  {
    let cadHora = "";
    if (!segundos)
    {
      cadHora = "";
    }
    else if (segundos == 0)
    {
      cadHora = this.servicio.rTraduccion()[371];
    }
    else if (segundos > 0 && segundos <= 60)
    {
      cadHora = this.servicio.rTraduccion()[372];
    }
    else if ((segundos / 3600) < 1)
    {
      cadHora = (segundos / 60).toFixed(1) + this.servicio.rTraduccion()[373] 
    }
    else
    {
      cadHora = (segundos / 3600).toFixed(2) + this.servicio.rTraduccion()[374] 
    }
    return cadHora
  }



}


