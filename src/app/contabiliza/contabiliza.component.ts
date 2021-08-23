import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-contabiliza',
  templateUrl: './contabiliza.component.html',
  styleUrls: ['./contabiliza.component.css']
})
export class ContabilizaComponent implements OnInit {

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
  detalle: any = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
  tituloBoton: string = this.servicio.rTraduccion()[157];
  

  constructor(
    public servicio: ServicioService,
    public dialogo: MatDialog, 
    public dialogRef: MatDialogRef<ContabilizaComponent>, 
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
      let sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET contabilizar = CASE WHEN contabilizar = 'S' THEN 'N' ELSE 'S' END, contabilizar_fecha = NOW(), contabilizar_usuario = " + this.servicio.rUsuario().id + " WHERE id = " + this.reporte;
      let campos = {accion: 200, sentencia: sentencia};
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.reporte = null;
        let mensaje = this.servicio.rTraduccion()[158];
        if (this.tituloBoton == this.servicio.rTraduccion()[157])
        {
          mensaje = this.servicio.rTraduccion()[159];
        }
        this.detalle = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
        this.tituloBoton = this.servicio.rTraduccion()[157];
        this.encontrado = false;
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal"
        if (mensaje == this.servicio.rTraduccion()[159])
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
  let sentencia = "SELECT c.id, c.contabilizar_fecha, IFNULL(i.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ncambio, c.contabilizar, c.fecha_reporte, CASE WHEN c.estatus = 0 THEN '" + this.servicio.rTraduccion()[160] + "' WHEN c.estatus = 10 THEN '" + this.servicio.rTraduccion()[161] + "' WHEN c.estatus = 100 THEN '" + this.servicio.rTraduccion()[162] + "' ELSE '" + this.servicio.rTraduccion()[163] + "' END AS nestatus, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, c.estatus, IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea,  IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntecnico FROM " + this.servicio.rBD() + ".reportes c LEFT JOIN " + this.servicio.rBD() + ".cat_lineas a ON c.linea = a.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas g ON c.maquina = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios e ON c.solicitante = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.tecnico = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios i ON c.contabilizar_usuario = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas h ON c.falla_ajustada = h.id WHERE c.id = " + this.reporte;
  let campos = {accion: 100, sentencia: sentencia};  
  this.servicio.consultasBD(campos).subscribe( resp =>
  {
    if (resp.length > 0)
    {
      if (resp[0].estatus < 1000)
      {
        
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "430px", panelClass:  'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[164], mensaje: this.servicio.rTraduccion()[165] + resp[0].nestatus + "</strong>", alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
        });
        return;
      }

      this.encontrado = true;
      this.detalle = resp[0];
      this.sioNo = resp[0].contabilizar=="S" ? this.servicio.rTraduccion()[1891] : this.servicio.rTraduccion()[1892]
      if (resp[0].contabilizar == "S")
      {
        this.tituloBoton = this.servicio.rTraduccion()[157];
      }
      else
      {
        this.tituloBoton = this.servicio.rTraduccion()[166];
      }

    }
    else
    {
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[167];
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      this.detalle = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
      this.tituloBoton = this.servicio.rTraduccion()[157];
      this.encontrado = false;
    }
  })
}

iniReporte()
{
  this.detalle = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
  this.tituloBoton = this.servicio.rTraduccion()[157];
  this.encontrado = false;
}

}
