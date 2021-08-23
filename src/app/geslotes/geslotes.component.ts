import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-geslotes',
  templateUrl: './geslotes.component.html',
  styleUrls: ['./geslotes.component.css']
})
export class GeslotesComponent implements OnInit {

  @ViewChild("txtT1", { static: false }) txtT1: ElementRef;

  clave: string = "";
  licencia: string = "";
  movil: boolean = false;
  validar01: boolean = false;
  validar02: boolean = false;
  validar03: boolean = false;
  encontrado: boolean = false;
  sioNo: string = "";
  reporte: number = null;
  detalle: any = {ruta_secuencia: "-", estatus: "-", referencia: "-", nombre: "-", nproceso: "-"};
  tituloBoton: string = this.servicio.rTraduccion()[338];
  

  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<GeslotesComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    
  }

  ngOnInit() {
  }

  validar(id: number)
  {
    if (id == 1)
    {
      let sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estatus = '" + (this.tituloBoton == this.servicio.rTraduccion()[338] ? "I" : "A") + "' WHERE numero = '" + this.reporte + "'";
      let campos = {accion: 200, sentencia: sentencia};
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.reporte = null;
        let mensaje = this.servicio.rTraduccion()[339];
        if (this.tituloBoton == this.servicio.rTraduccion()[338])
        {
          mensaje = this.servicio.rTraduccion()[340];
        }
        this.detalle = {ruta_secuencia: "-", estatus: "-", referencia: "-", nombre: "-", nproceso: "-"};
        this.tituloBoton = this.servicio.rTraduccion()[338];
        this.encontrado = false;
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal"
        if (mensaje == this.servicio.rTraduccion()[340])
        {
          mensajeCompleto.clase = "snack-error"
        }
        this.validar01 = false;
        this.validar02 = false;
        mensajeCompleto.mensaje = mensaje;
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        setTimeout(() => {
          this.txtT1.nativeElement.focus();  
        }, 100);
        
      });
    }
    else
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
  }


buscarReporte()
{
  let sentencia = "SELECT a.estatus, a.ruta_secuencia, IFNULL(b.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos c ON a.proceso = c.id WHERE a.numero = '" + this.reporte + "'";
  let campos = {accion: 100, sentencia: sentencia};  
  this.servicio.consultasBD(campos).subscribe( resp =>
  {
    if (resp.length > 0)
    {
      this.encontrado = true;
      this.detalle = resp[0];
      this.sioNo = resp[0].estatus == "S" ? this.servicio.rTraduccion()[1891] : this.servicio.rTraduccion()[1892]
      if (resp[0].estatus == "A")
      {
        this.tituloBoton = this.servicio.rTraduccion()[338];
      }
      else
      {
        this.tituloBoton = this.servicio.rTraduccion()[341];
      }

    }
    else
    {
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[342];
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      this.detalle = {ruta_secuencia: "-", estatus: "-", referencia: "-", nombre: "-", nproceso: "-"};
      this.tituloBoton = this.servicio.rTraduccion()[338];
      this.encontrado = false;
    }
  })
}

iniReporte()
{
  this.detalle = {ruta_secuencia: "-", estatus: "-", referencia: "-", nombre: "-", nproceso: "-"};
  this.tituloBoton = this.servicio.rTraduccion()[338];
  this.encontrado = false;
}

}
