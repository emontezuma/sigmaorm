import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common'
import validator from 'devextreme/ui/validator';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-horaxhora',
  templateUrl: './horaxhora.component.html',
  styleUrls: ['./horaxhora.component.css']
})
export class HoraxhoraComponent implements OnInit {

  @ViewChild("txtT1", { static: false }) txtT1: ElementRef;
  @ViewChild("txtT2", { static: false }) txtT2: ElementRef;
  @ViewChild("txtT3", { static: false }) txtT3: ElementRef;
  @ViewChild("txtT4", { static: false }) txtT4: ElementRef;

  maquinas = [];
  causas = [];
  responsables = [];
  movil: boolean = false;
  planOriginal: number = 0;
  horaOriginal: number = 0;
  idPlan: number = 0;
  validar01: boolean = false;
  validar02: boolean = false;
  validar03: boolean = false;
  tipoResumen: string = "";
  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  error04: boolean = false;
  error05: boolean = false;
  error06: boolean = false;
  error07: boolean = false;
  error08: boolean = false;
  error09: boolean = false;
  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<HoraxhoraComponent>, 
    public dialogo: MatDialog,
    public datepipe: DatePipe,
    
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    
  }

  ngOnInit() 
  {
    this.planOriginal = +this.datos.piezas; 
    this.horaOriginal = +this.datos.hora; 
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 105 AND estatus = 'A' ORDER BY nombre;"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: "0", nombre: this.servicio.rTraduccion()[1493]})
      if (resp.length > 0)
      {
        this.causas = resp;
      }
    });
    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 140 AND estatus = 'A' ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: "0", nombre: this.servicio.rTraduccion()[1493]})
      if (resp.length > 0)
      {
        this.responsables = resp;
      }
    });
    if (this.datos.editando)
    {
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-error";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[3715]
      mensajeCompleto.tiempo = 4000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
    }
  }


  validar(id: number)
  {
    if (this.datos.editando && id == 1)
    {
      this.validar(11);
      return;
    }
    this.error01 = false;
    this.error02 = false;
    this.error02 = false;
    this.error04 = false;
    this.error05 = false;
    this.error06 = false;
    this.error07 = false;
    this.error08 = false;
    this.error09 = false;
    let miHora = +this.datos.hora < 10 ? "0" +this.datos.hora :this.datos.hora;
      
    this.datos.piezas = !this.datos.piezas ? 0 : this.datos.piezas; 
    this.datos.disponible = !this.datos.disponible ? 0 : this.datos.disponible;
    this.datos.paro = !this.datos.paro ? 0 : this.datos.paro;
    let errores = 0;
    if (id == 1)
    {
      if (+this.datos.paro < 0 || +this.datos.paro > 3600)
      {
        this.error05 = true;
        this.txtT4.nativeElement.focus();
        errores = errores + 1;
      }
      if (+this.datos.paro + +this.datos.disponible > 3600)
      {
        this.error04 = true;
        this.txtT3.nativeElement.focus();
        errores = errores + 1;
      }
      if (+this.datos.disponible < 0 || +this.datos.disponible > 3600)
      {
        this.error03 = true;
        this.error04 = false;
        this.txtT3.nativeElement.focus();
        errores = errores + 1;
      }
      if (+this.datos.piezas == 0 && +this.datos.disponible > 0) 
      {
        this.error02 = true;
        this.txtT2.nativeElement.focus();
        errores = errores + 1;
      }
      if (+this.datos.piezas > 0 && +this.datos.disponible == 0)
      {
        this.error06 = true;
        this.txtT2.nativeElement.focus();
        errores = errores + 1;
      }
      if (this.datos.scrap)
      {
        if (+this.datos.scrap > 0 && +this.datos.scrap > +this.datos.produccion)
        {
          this.error09 = true;
          this.txtT4.nativeElement.focus();
          errores = errores + 1;
        }
      }
      if (!this.datos.fecha)
      {
        this.error01 = true;
        this.txtT1.nativeElement.focus();
        errores = errores + 1;
      }
      else if (this.datepipe.transform(this.datos.fecha, "yyyyMMdd") + miHora <= this.datepipe.transform(new Date(), "yyyyMMddHH")) 
      {
        this.error07 = true;
        this.txtT1.nativeElement.focus();
        errores = errores + 1;
      }
      if (errores > 0)
      {
        return;
      }
      ;
      let sentencia = "SELECT id FROM " + this.servicio.rBD() + ".horaxhora WHERE equipo = " + this.datos.maquina + " AND dia = '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + "' AND hora = " + this.datos.hora + " AND estatus = 'A' "
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
          if (resp.length > 0)
          { 
            if (resp[0].id != this.datos.id)
            { 
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[3684];
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.error08 = true;
              return;
            }
            else
            {
              this.validar(5);
            }
          }
          else
          {
            this.validar(5);
          }
      })
    }
    else if(id == 5)
    {
      let sentencia = "SELECT objetivo, van FROM " + this.servicio.rBD() + ".equipos_objetivo WHERE (equipo = " + this.datos.maquina + " OR equipo = 0) AND (lote = " + +this.datos.lote + " OR lote = 0) AND (fijo = 'S' OR ('" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + "' >= desde AND '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + "' <= hasta)) ORDER BY lote DESC, equipo DESC LIMIT 1"
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3738];
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          return;
        } 
        else 
        {
          this.idPlan = resp[0].objetivo;
          this.validar(6);
        }
      })
    }
    else if(id == 6)
    {
      let sentencia = "SELECT SUM(plan) AS tplan FROM " + this.servicio.rBD() + ".horaxhora WHERE (equipo = " + this.datos.maquina + " OR equipo = 0) AND (lote = " + this.datos.lote + " OR lote = 0) AND estatus IN ('Z', 'A')"
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (+resp[0].tplan - +this.planOriginal + +this.datos.piezas > +this.idPlan)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3739].replace("campo_0", this.idPlan * 1).replace("campo_1", resp[0].tplan * 1);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          return;
        } 
        else 
        {
          this.validar(7);
        }
      })
    }
    else if(id == 7)
    {
      let laHora = +this.datos.hora < 10 ? "0" + this.datos.hora : this.datos.hora; 
      let sentencia = "SELECT secuencia, termina FROM " + this.servicio.rBD() + ".cat_turnos WHERE estatus = 'A' AND termina > '" + laHora + ":00:00' AND termina < '" + laHora + ":59:59'"
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3740];
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          return;
        } 
        else 
        {
          this.validar(11);
        }
      })
    }
    else if (id == 11)
    {
      this.error09 = false;
      if (this.datos.scrap)
      {
        if (+this.datos.scrap > 0 && +this.datos.scrap > +this.datos.produccion)
        {
          this.error09 = true;
          this.txtT4.nativeElement.focus();
          return;
        }
      }
      let miHora = +this.datos.hora < 10 ? "0" +this.datos.hora :this.datos.hora;
      this.datos.comentarios = this.datos.comentarios == "null" ? "" : this.datos.comentarios;
      this.datos.comentarios = !this.datos.comentarios ? "" : this.datos.comentarios; 
      this.datos.scrap = !this.datos.scrap ? "0" : this.datos.scrap; 
      let sentencia = "INSERT INTO " + this.servicio.rBD() + ".horaxhora (lote, equipo, dia, hora, desde, hasta, plan, disponible, mantto, comentarios, responsable, responsable2, causa, tipo) VALUES(" + this.datos.lote + ", " + this.datos.maquina + ", '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + "', " + this.datos.hora + ", '" + miHora + ":00:00', '" + miHora + ":59:59', " + +this.datos.piezas + ", " + +this.datos.disponible + ", " +this.datos.paro + ", '" + this.datos.comentarios + "', " + +this.datos.responsable + ", " + +this.datos.responsable2 + ", " + +this.datos.causa + ", 1);UPDATE " + this.servicio.rBD() + ".cat_maquinas SET compaginar = 'S', compaginar_desde = '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + miHora + "' WHERE id = " + this.datos.maquina;
      if (this.datos.id > 0)
      {
        if (!this.datos.editando)
        {
          this.datos.comentarios = this.datos.comentarios == "null" ? "" : this.datos.comentarios;
          sentencia = "UPDATE " + this.servicio.rBD() + ".horaxhora SET dia = '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + "', hora = " + this.datos.hora + ", desde = '" + miHora + ":00:00', hasta = '" + miHora + ":59:59', plan = " + +this.datos.piezas + ", disponible = " + +this.datos.disponible + ", mantto = " +this.datos.paro + ", comentarios = '" + this.datos.comentarios + "', responsable = " + +this.datos.responsable + ", responsable2 = " + this.datos.responsable2 + ", causa = " + +this.datos.causa + " WHERE id = " + this.datos.id + ";UPDATE " + this.servicio.rBD() + ".cat_maquinas SET compaginar = 'S', compaginar_desde = '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + miHora + "' WHERE id = " + this.datos.maquina;
        }
        else
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".horaxhora SET comentarios = '" + this.datos.comentarios + "', responsable = " + +this.datos.responsable + ", responsable2 = " + this.datos.responsable2 + ", causa = " + +this.datos.causa + ", scrap = " + +this.datos.scrap + " WHERE id = " + this.datos.id + (+this.datos.scrap > 0 ? ";INSERT INTO " + this.servicio.rBD() + ".scraps (hora, usuario) VALUES (" + this.datos.id + ", " + this.servicio.rUsuario().id + ")" : "");
          //Se propaga el cambio
        }
         
      }
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.datos.accion = id;
        this.dialogRef.close(this.datos);
      })
    }
    else if (id == 2)
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
    else if (id == 3)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[3706], mensaje: this.servicio.rTraduccion()[3707], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_eliminar" }
      });
      respuesta.afterClosed().subscribe(result => 
      {
        if (result)
        {
          if (result.accion != 1)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381]
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else
          {
            let miHora = +this.horaOriginal < 10 ? "0" +this.horaOriginal : this.horaOriginal;
            let sentencia = "DELETE FROM " + this.servicio.rBD() + ".horaxhora WHERE id = " + this.datos.id + ";UPDATE " + this.servicio.rBD() + ".cat_maquinas SET compaginar = 'S', compaginar_desde = '" + this.datepipe.transform(this.datos.fecha, "yyyy/MM/dd") + miHora + "' WHERE id = " + this.datos.maquina
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[3708]
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.datos.accion = id;
              this.dialogRef.close(this.datos);
            });
          }
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381]
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      })
    }
  }

  calcularHR(segundos: number)
  {
    let cadHora = "";
    if (!segundos)
    {
      cadHora = "";
    }
    else if (segundos > 3600)
    {
      cadHora = this.servicio.rTraduccion()[3674];
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