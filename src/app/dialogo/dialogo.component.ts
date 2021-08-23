import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common'
    

@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrls: ['./dialogo.component.css']
})
export class DialogoComponent implements OnInit {

  @ViewChild("txtT1", { static: false }) txtT1: ElementRef;
  @ViewChild("txtT2", { static: false }) txtT2: ElementRef;
  @ViewChild("lstC1", { static: false }) lstC1: MatSelect;
  movil: boolean = false;
  validar01: boolean = false;
  validar02: boolean = false;
  validar03: boolean = false;
  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  error22: boolean = false;
  cadBoton1: string = this.datos.boton1STR;
  cadenaAntes: string = "";
  mensajeError: string = "";
  tiempoFalta: number = 0;
  mostrarTiempo: boolean = false;
  turnoViene: number = -1;
  ordenValor: any = [];
  procesos: any = [];
  usuarios: any = [];
  partes: any = [];
  tablas: any = [];
  herramentales: any = [];


  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<DialogoComponent>, 
    public datepipe: DatePipe,

    @Inject(MAT_DIALOG_DATA) public datos: any
    
  ) 
  {
    this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      this.cadaSegundo();
    });
    this.tiempoFalta =  + this.servicio.rConfig().limitar_respuestas;
    if (this.tiempoFalta && this.datos.tiempo != -1 && !datos.agregarValor && !datos.agregarRuta && !datos.modificarVan)
    {
      this.mostrarTiempo = true;
      this.datos.boton1STR =  this.cadBoton1 + " (" + this.tiempoFalta + ")";      
    }
    var re = new RegExp(String.fromCharCode(160), "g");
    if (this.datos.mensaje)
    {
      this.datos.mensaje = this.datos.mensaje.replace(re, " ")
    }
    
  }

  turnos: any = [];
  mostrarCancelar: boolean = this.servicio.rConfig().turno_modo != 2 || !this.datos.turno ;
  tActual: string = "";
  mensajeTurno: string = "";

  ngOnInit() {

    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === "Escape") 
      {
        ///this.servicio.aEscapado(true);   CUIDADO
        this.validar(this.datos.botones);
      }
    });
  
    this.dialogRef.backdropClick().subscribe(event => {
      this.validar(this.datos.botones);
    });

    
    if (this.datos.kanban == 10 || this.datos.kanban == 11)
    {
      this.listarCausas();
    }
    else if (this.datos.kanban == 40)
    {
      this.datos.fdesde = new Date();
      this.datos.fdesde.setHours(this.datos.fdesde.getHours() + 1);
      this.datos.desde = this.servicio.fecha(2, this.datos.fdesde, "HH") + ":00:00";
      this.listarKanban();
    }
    else
    {
      this.listarTurnos();
    }
    if (this.datos.agregarRuta > 0)
    {
      this.listarRutas();
    }
    
    if (this.datos.agregarValor > 0)
    {
      this.ordenValor.push(this.servicio.rTraduccion()[186]);
      this.ordenValor.push(this.servicio.rTraduccion()[187]);
      if (this.datos.totalValores > 1)
      {
        let limite = this.datos.totalValores;
        if (this.datos.agregarValor == 1)
        {
          limite = limite + 1;
        }
        for (var i = 2; i < limite ; i++)
        {
          this.ordenValor.push(i)
        }
        
      }
      if (this.datos.orden == -1)
      {
        this.datos.orden = 1;
      }
      else if (this.datos.orden == this.datos.totalValores - 1)
      {
        this.datos.orden = 1;
      }
      else if (this.datos.orden == 0)
      {
        this.datos.orden = 0;
      }
      else
      {
        this.datos.orden = +this.datos.orden + 1;
      }     
    }
    else if (this.datos.agregarRuta > 0)
    {
      this.ordenValor.push(this.servicio.rTraduccion()[186]);
      this.ordenValor.push(this.servicio.rTraduccion()[187]);
      if (this.datos.totalValores > 1)
      {
        let limite = this.datos.totalValores;
        if (this.datos.agregarRuta == 1)
        {
          limite = limite + 1;
        }
        for (var i = 2; i < limite ; i++)
        {
          this.ordenValor.push(i)
        }
        
      }
      if (this.datos.orden == -1)
      {
        this.datos.orden = 1;
      }
      else if (this.datos.orden == this.datos.totalValores - 1)
      {
        this.datos.orden = 1;
      }
      else if (this.datos.orden == 0)
      {
        this.datos.orden = 0;
      }
      else
      {
        this.datos.orden = +this.datos.orden + 1;
      }     
    }
    else if (this.datos.modificarVan)
    {
      this.datos.valorVariable = this.datos.valorVariable * 1; 
      this.txtT1.nativeElement.focus();
    }
  }
  
  listarCausas()
  {
    this.tActual = this.servicio.rTraduccion()[188];
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_generales WHERE tabla = 160 ORDER BY nombre;"
    this.turnos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[1492]});
      this.turnos = resp;
      this.datos.causa = 0;
    })
  }

  listarKanban()
  {
    this.tablas = [];
    let sentencia = "SELECT id, nombre, notas, respetar_secuencia, area, usuario_asignado FROM " + this.servicio.rBD() + ".cat_kanban WHERE estatus = 'A' ORDER BY nombre;"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.tablas = resp;
      if (resp.length > 0)
      {
        this.datos.kanbanPlan = resp[0].id;
        this.datos.kanbanUsuario = !resp[0].usuario_asignado ? "0" : resp[0].usuario_asignado;
        this.datos.nombre = resp[0].nombre;
        this.datos.notas = resp[0].notas;
        this.datos.area = resp[0].area;
        this.datos.respetar_secuencia = resp[0].respetar_secuencia
      }
    })

    this.usuarios = [];
    sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_usuarios WHERE rol IN ('A', 'M') AND estatus = 'A' ORDER BY nombre;"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: "0", nombre: this.servicio.rTraduccion()[1493]});
      this.usuarios = resp;
    })
  }

  listarRutas()
  {
    this.procesos = [];
    this.partes = [];
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_procesos WHERE estatus = 'A' AND kanban = 'S' ORDER BY nombre;"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[1493]});
      this.procesos = resp;
    })

    sentencia = "SELECT a.id, CASE WHEN ISNULL(a.referencia) THEN a.nombre ELSE CONCAT(a.nombre, '" + this.servicio.rTraduccion()[2637] + "', a.referencia, ')') END AS nombre, a.nombre AS nnombre, b.url_mmcall AS dunidad FROM " + this.servicio.rBD() + ".cat_partes a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.kanban_unidad = b.id WHERE kanban = 'S' ORDER BY 2"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[1493]});
      this.herramentales = resp;
      if (this.datos.parte == 0)
      {
        this.datos.herramental = -1;
        this.datos.parte = this.servicio.rTraduccion()[1493];
      }
      else
      {
        this.datos.herramental = this.datos.parte;
        this.buscarDatos(1, this.datos.herramental)
      }

    })
    
  }


  listarTurnos()
  {
    this.tActual = this.servicio.rTraduccion()[188];
    let sentencia = "SELECT id, nombre, inicia, termina, secuencia FROM " + this.servicio.rBD() + ".cat_turnos ORDER BY secuencia;"
    this.turnos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.turnos = resp;
      
      if (this.datos.id == 0)
      {
        this.mensajeTurno = this.servicio.rTraduccion()[189]
        if (resp.length > 0)
        {
          for (var i = 0; i < resp.length; i++) 
          {
            if (resp[i].id == this.servicio.rTurno().id)
            {
              this.tActual = this.servicio.rTraduccion()[190] +  resp[i].nombre + " (" + resp[i].inicia + "-" + resp[i].termina + ")";
            }
            if (+resp[i].secuencia > +this.servicio.rTurno().secuencia)
            {
              this.datos.idTurno = resp[i].id;
              this.turnoViene = 1;
            }
          }
          if (this.turnoViene == -1)
          {
            this.datos.idTurno = resp[0].id;
          } 
        }
      }
      else if (this.datos.id != -1)
      {
        this.mensajeTurno = this.servicio.rTraduccion()[189]
        this.datos.idTurno = this.datos.id;
      }
      else
      {
        this.datos.idTurno = this.servicio.rTurno().id;
        this.mensajeTurno = this.servicio.rTraduccion()[191]
        this.tActual = this.servicio.rTraduccion()[190] +  this.servicio.rTurno().nombre + " (" + this.servicio.rTurno().inicia + "-" + this.servicio.rTurno().termina + ")";
      }
    });
  }
  
  validar(id: number)
  {
    if (id == 1 && this.datos.replanear>0)
    {
      let miHora = +this.datos.horaIni < 10 ? "0" +this.datos.horaIni :this.datos.horaIni;
      this.error01 = false;
      this.error02 = false;
      let errores = 0
      if (!this.datos.fechaIni)
      {
        this.error01 = true;
        this.txtT1.nativeElement.focus();
        errores = errores + 1;
      }
      else if (this.datepipe.transform(this.datos.fechaIni, "yyyyMMdd") + miHora <= this.datepipe.transform(new Date(), "yyyyMMddHH")) 
      {
        this.error02 = true;
        this.txtT1.nativeElement.focus();
        errores = errores + 1;
      }
      if (errores > 0)
      {
        return;
      }
    }
    else if (id == 1 && this.datos.agregarRuta>0)
    {
      this.error01 = false;
      this.error02 = false;
      this.error03 = false;
      let errores = 0
      if (this.datos.proceso==0)
      {
        this.error01 = true;
        this.lstC1.focus();
        errores = errores + 1;
      }
      if (this.datos.herramental==-1)
      {
        this.error02 = true;
        if (errores == 0)
        {
          this.txtT2.nativeElement.focus();
        }
        errores = errores + 1;
      }
      if (+this.datos.nuevaCantidad <= 0 || !this.datos.nuevaCantidad)
      {
        this.error03 = true;
        if (errores == 0)
        {
          this.txtT1.nativeElement.focus();
        }
        errores = errores + 1;
      }
      if (errores > 0)
      {
        return;
      }
      this.datos.parte = this.datos.herramental       
    }
    else if (id == 1 && this.datos.kanban == 40)
    {
      this.mensajeError = "";
      if (!this.datos.desde || !this.datos.fdesde)
      {
        if (!this.datos.fdesde)
        {
          this.txtT1.nativeElement.focus();
        }
        else
        {
          this.txtT2.nativeElement.focus();
        }
        this.error22 = true;
        this.mensajeError = this.servicio.rTraduccion()[4171];
        return;
      }  
      if (new Date(this.servicio.fecha(2, this.datos.fdesde, "yyyy/MM/dd") + " " + this.datos.desde) < new Date())
        {
          this.error22 = true;
          this.txtT1.nativeElement.focus();
          this.mensajeError = this.servicio.rTraduccion()[4172];
          return;
          
        }
    }
    this.datos.notas = !this.datos.notas ? "" : this.datos.notas == "null" ? "" : this.datos.notas == "undefined" ? "" : this.datos.notas;
    this.datos.accion = id;
    //this.datos.idturno = 
    this.dialogRef.close(this.datos);
  }

  cadaSegundo()
  {
    if (this.tiempoFalta >= 0 && this.mostrarTiempo)
    {      
      this.tiempoFalta = this.tiempoFalta - 1;
      if (this.tiempoFalta == -1)
      {
        if (this.datos.mensaje.length==0 && this.servicio.rConfig().turno_modo == 2)
        {
          this.datos.accion = 1;  
        }
        else if (this.datos.boton_cancelar)
        {
          this.datos.accion = this.datos.boton_cancelar;
        }
        else
        {
          this.datos.accion = 3;
        }
        
        this.dialogRef.close(this.datos);
      }
      else
      {
        this.datos.boton1STR =  this.cadBoton1 + " (" + this.tiempoFalta + ")";
      }
      
      
    }
  }  

  filtrando(indice: number, evento: any)
  {
    if (indice==1)
    {
      let miCad = "";
      if (evento.target)
      {
        miCad = evento.target.value;
      }
      else
      {
        miCad = evento;
      }
      if (this.cadenaAntes != miCad )
      {
        this.cadenaAntes = miCad;
        setTimeout(() => {
          this.filtrando(1, this.cadenaAntes);
        }, 300);
        return;
      }
      this.partes = [];
      this.datos.herramental = -1;
      this.servicio.activarSpinnerSmall.emit(true);
      if (miCad) 
      {
        for (var i = 0; i < this.herramentales.length; i  ++)
        {
          if (this.herramentales[i].nombre)
          {
            if (this.herramentales[i].nombre.toLowerCase().indexOf(miCad.toLowerCase()) !== -1)
            {
              this.partes.splice(this.partes.length, 0, this.herramentales[i]);
            }
          }
        }
      }
      else
      {
        this.partes = this.herramentales;
      }
      this.servicio.activarSpinnerSmall.emit(false);
    }
    
  }

  buscarDatos(indice: number, evento: any)
  {
    if (indice == 1)
    {
      let idBuscar: number;
      if (evento.option)
      {
        if (+evento.option.value == 0)
        {
          this.datos.parte = this.servicio.rTraduccion()[1493];
          this.datos.herramental = 0;
          return;
        }
        else
        {
          idBuscar = +evento.option.value
        }
      }
      else
      {
        idBuscar = evento;
        if (+idBuscar == 0)
        {
          this.datos.parte = this.servicio.rTraduccion()[1493];
          this.datos.herramental = 0;
          return;
        }
      }
      //Buscar parte
      this.servicio.activarSpinnerSmall.emit(true);
      let sentencia = "SELECT a.id, CASE WHEN ISNULL(a.referencia) THEN a.nombre ELSE CONCAT(a.nombre, '" + this.servicio.rTraduccion()[2637] + "', a.referencia, ')') END AS nombre, a.nombre AS nnombre, b.url_mmcall AS dunidad FROM " + this.servicio.rBD() + ".cat_partes a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.kanban_unidad = b.id WHERE a.id = " + idBuscar;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.datos.parte = resp[0].nombre; 
          this.partes = resp;
          this.datos.herramental = resp[0].id;
          this.datos.nparte = resp[0].nnombre;    
          this.datos.dunidad = resp[0].dunidad; 
          this.error02 = false;
        }
        setTimeout(() => {
          this.servicio.activarSpinnerSmall.emit(false);
        }, 100);
      })
    }
  }

  nProceso(id: any)
  {
    let proceso = this.procesos.find(miProceso => miProceso.id == id.value)
    this.datos.nproceso = proceso.nombre
    //this.datos.nproceso = this.procesos.find(ce => ce.id==id);
    //this.datos.nproceso = this.procesos[id].nombre; 
    this.error01 = false;
  }

  nKanban(id: any)
  {
    let kanban = this.tablas.find(miKanban => miKanban.id == id.value)
    this.datos.nombre = kanban.nombre
    this.datos.notas = kanban.notas
    this.datos.area = kanban.area
    this.datos.kanbanUsuario = !kanban.usuario_asignado ? "0" : kanban.usuario_asignado;  
    
    this.datos.respetar_secuencia = kanban.respetar_secuencia
    //this.datos.nproceso = this.procesos.find(ce => ce.id==id);
    //this.datos.nproceso = this.procesos[id].nombre; 
    this.error01 = false;
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

