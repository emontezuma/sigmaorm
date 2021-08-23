import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DialogowipComponent } from '../dialogowip/dialogowip.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ViewportRuler } from "@angular/cdk/overlay";
import { SesionComponent } from '../sesion/sesion.component';

@Component({
  selector: 'app-operaciones',
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.css'],
  animations: [
    trigger('esquema', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(5px)' }),
        animate('0.1s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.2s', style({ opacity: 0, transform: 'translateY(5px)' }))
      ])
    ]),
    trigger('arriba', [
    transition(':enter', [
      style({ opacity: 0.3, transform: 'scale(0.3)' }),
      animate('0.1s', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
    transition(':leave', [
      animate('0.1s', style({ opacity: 0.3, transform: 'scale(0.3)' }))
    ])
  ]),]
})


export class OperacionesComponent implements OnInit {

  constructor
  (
    public snackBar: MatSnackBar, 
    public servicio: ServicioService,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private router: Router, 
    private viewportRuler: ViewportRuler
  ) 
  {
    this.emit00 = this.servicio.mensajeError.subscribe((mensaje: any)=>
    {
      let mensajes = mensaje.split(";");
      if (mensajes[0] == 1)
      {
        this.pantalla = 1;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2007]);
        this.errorMensaje = mensajes[1];
      }
    });

    this.escaner = this.servicio.escaneado.subscribe((cadena: string)=>
    {
      //Se escane a el lote
      //this.servicio.aEscanear(false);
      this.validarEntrada(cadena);
    });

    this.emit10 = this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10;
      this.verBarra = "auto";
    });
    this.emit20 = this.servicio.cambioTurno.subscribe((accion: boolean)=>
    {
      this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
    });

    this.emit30 = this.servicio.quitarBarra.subscribe((accion: boolean)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10 + 300;
    });
    this.emit40 = this.servicio.teclaBuscar.subscribe((accion: boolean)=>
    {
      this.buscar();
    });
    this.emit50 = this.servicio.teclaProceso.subscribe((accion: boolean)=>
    {
      this.solicitarIdentificacion();
    });
    this.emit60 = this.servicio.teclaResumen.subscribe((accion: boolean)=>
    {
      this.resumen();
    });
    this.emit70 = this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.escapar();
    });
    this.emit80 = this.vistaCatalogo = this.servicio.vista.subscribe((vista: number)=>
    {
      this.validarProcesos();      

    });
    this.emit90 = this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 12) == "/operaciones" && this.vista != 1)
      {
        this.cadaSegundo();
      }
    });
    this.emit100 = this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.cancelar();
    });
    this.emit110 = this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.configuracion();
    if (this.procesoSeleccionado.id == 0)
    {
      this.validarProcesos();      
    }
   }

  pantalla: number = 2;
  indices: any = [{ nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"} ];
  nuevoRegistro: string = ";"
  verRegistro: number = 0;
  cronometrando: boolean = false;
  conLote: number = 0;

  colorLetrasBotones: string = "";
  colorLetrasBotonesDes: string = "";
  colorFondoBoton: string = "";
  colorLetrasTitulo: string = "";
  colorBarraSuperior: string = "";
  colorSN: string = "";
  colorLetrasBox: string = "";
  colorFondo: string = "";
  colorFondoCabecera: string = "";
  colorBorde: string = "";
  colorFondoTarjeta: string = "";
  rutaActual: number = 0;
  //Colores generales
  colorAlerta: string = "tomato";
  tiempoAlerta: number = 30;
  arrFiltrado: any = [];
  textoBuscar: string = "";
  vista: number = 1;
  estadoActual: string = "";
  mensajeLote: string = "";
  mensajeBase: string = "";
  tipoLote: number = 0;
  esperaDisparo: number = 0;
  verEspera: boolean = false;
  disparoSiguiente: number = 0;
  loteMover: number = 0;
  parteMover: number = 0;
  loteNumeroMover: string = "";
  ultimaSecuencia: number = 0;
  ultimaRutaDetalle: number = 0;
  procesoAnterior: number = 0;
  loteEstado: number = 0;
  lote_inspeccion_clave: string = "N"
  situacionCalidad: string = "";
  causaInspeccion: number = 0;
  inspector: number = 0;
  accionCalidad: number = 0;
  
  //
  tiempo: string = "";
  tiempoTitulo: string = "";
  tiempoDetalle: string = "";
  verIrArriba: boolean = false;
  verImagen: boolean = false;
  cronometro: any;
  offSet: number;
  enProceso: any = [];
  enStock: any = [];
  enEspera: any = [];
  detalles: any = [];
  detLote: any = [];
  tiempo_entre_lecturas: number = 20;
  salto_adelante: boolean = true;
  salto_atras: boolean = false;
  tipo_flujo: string = ""

  configuracionBF: boolean = false;
  bot1Sel: boolean = false;
  bot2Sel: boolean = false;
  bot3Sel: boolean = false;
  bot4Sel: boolean = false;
  bot5Sel: boolean = false;
  bot6Sel: boolean = false;
  bot7Sel: boolean = false;
  bot8Sel: boolean = false;
  bot9Sel: boolean = false;
  bot10Sel: boolean = false;

  arreHover: any = [];
  arreHover2: any = [];
  arreHover3: any = [];
  arreHover4: any = [];
  arreHover5: any = [];
  

  
  procesoSeleccionado: any = {id: 0, nombre: "", capacidad_proceso: 0, capacidad_stock: 0, desde: "", imagen: "", lotes: 0, items: 0, };
  verBuscar: boolean = true;
  noAnimar: boolean = false;  
  permiteBuscar: boolean = true;  
  verBarra: string = "auto";
  altoPantalla: number = this.servicio.rPantalla().alto - 105;
  anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
  errorMensaje: string = "";
  procesos: any = [];
  iconoGeneral = "i_procesos";
  iconoParte = "i_partes";


  //URL_BASE = "http://localhost:8081/sigma/api/upload.php";
  //URL_IMAGENES = "http://localhost:8081/sigma/assets/imagenes/";

  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("lstProceso", { static: false }) lstProceso: MatSelect;

  scrollingSubscription: Subscription;
  escaner: Subscription;
  vistaCatalogo: Subscription;

  ngOnInit() 
  {
    this.servicio.validarLicencia(1)
    this.servicio.mostrarBmenu.emit(0);
    this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
  }

  ngOnDestroy() {
    if (this.scrollingSubscription) 
    {
      this.scrollingSubscription.unsubscribe()
    }

    if (this.vistaCatalogo) 
    {
      this.vistaCatalogo.unsubscribe()
    }

    if (this.escaner) 
    {
      this.escaner.unsubscribe()
    }

    if (this.emit00) {this.emit00.unsubscribe()}
  if (this.emit10) {this.emit10.unsubscribe()}
  if (this.emit20) {this.emit20.unsubscribe()}
  if (this.emit30) {this.emit30.unsubscribe()}
  if (this.emit40) {this.emit40.unsubscribe()}
  if (this.emit50) {this.emit50.unsubscribe()}
  if (this.emit60) {this.emit60.unsubscribe()}
  if (this.emit70) {this.emit70.unsubscribe()}
  if (this.emit80) {this.emit80.unsubscribe()}
  if (this.emit90) {this.emit90.unsubscribe()}
  if (this.emit100) {this.emit90.unsubscribe()}
  if (this.emit110) {this.emit90.unsubscribe()}
 }

emit00: Subscription;
emit10: Subscription;
emit20: Subscription;
emit30: Subscription;
emit40: Subscription;
emit50: Subscription;
emit60: Subscription;
emit70: Subscription;
emit80: Subscription;
emit90: Subscription;
emit100: Subscription;
emit110: Subscription;

  
  salidaEfecto(evento: any)
  {
    if (evento.toState && this.verRegistro > 0)
    {
       if (this.verRegistro == 21 || this.verRegistro == 1)      
       {
        this.verRegistro = 1;
       }
       else if (this.verRegistro == 22 || this.verRegistro == 2)      
       {
        this.verRegistro = 2;
       }
       else if (this.verRegistro == 23 || this.verRegistro == 3)      
       {
        this.verRegistro = 3;
       }
    }

    setTimeout(() => {
      this.verImagen = true  
    }, 300);
    
  }

  irArriba() {
    this.verIrArriba = false;
    document.querySelector('[cdkScrollable]').scrollTop = 0;    
  }

  miScroll(data: CdkScrollable) {
    const scrollTop = data.getElementRef().nativeElement.scrollTop || 0;
      if (scrollTop < 5) 
      {
        this.verIrArriba = false
      }
      else 
      {
        this.verIrArriba = true
        clearTimeout(this.cronometro);
        this.cronometro = setTimeout(() => {
          this.verIrArriba = false;
        }, 3000);
      }

    this.offSet = scrollTop;
  }

  validarProcesos()
  {
    this.servicio.activarSpinner.emit(true);       
    let sentencia = "SELECT a.id FROM " + this.servicio.rBD() + ".cat_procesos a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso WHERE a.estatus = 'A' AND b.usuario = " + this.servicio.rUsuario().id + " AND b.tipo = 0 ORDER BY a.nombre;"
    if (this.servicio.rUsuario().operacion=="S")
    {
      sentencia = "SELECT a.id FROM " + this.servicio.rBD() + ".cat_procesos a WHERE a.estatus = 'A' ORDER BY a.nombre;"
    }
    
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 1)
      {
        this.vista = 1;
        this.verRegistro = 2;
        this.permiteBuscar = true;
        this.listarProcesos();
        
      }
      else if (resp.length == 1)
      {
        this.verRegistro = 2;        
        this.procesoSeleccionado.id = resp[0].id;
        this.resumen();
        this.permiteBuscar = false;
      }
      else
      {
        this.servicio.aEscanear(false);
        this.vista = 1;
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2814].replace("campo_0", this.servicio.rUsuario().nombre);
        mensajeCompleto.tiempo = 2500;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        }
    })
    
  }
  listarProcesos()
  {
    this.arreHover = [];
    this.servicio.activarSpinner.emit(true);       
    //let sentencia = "SELECT id, imagen, nombre, referencia, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM " + this.servicio.rBD() + ".cat_maquinas WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 20 and proceso = a.id) AS enstock, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 and proceso = a.id) AS enproceso, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_procesos a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso WHERE a.estatus = 'A' AND b.usuario = " + this.servicio.rUsuario().id + " ORDER BY a.nombre;"
    let sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL(z.capproceso, 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, IFNULL(y.totall_2, 0) AS totall, IFNULL(y.espera_2, 0) AS espera, IFNULL(y.stock_2, 0) AS stock, CASE WHEN a.capacidad_stock = 0 THEN 0 ELSE FLOOR((SELECT stock) / a.capacidad_stock * 100) END AS pctstock, IFNULL(y.proceso_2, 0) AS en_proceso, CASE WHEN (SELECT cap_proceso) = 0 THEN 0 ELSE FLOOR((SELECT en_proceso) / (SELECT cap_proceso) * 100) END AS pctproceso, IFNULL(y.calidad_2, 0) AS calidad FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN (SELECT proceso, SUM(capacidad) AS capproceso FROM " + this.servicio.rBD() + ".cat_maquinas WHERE estatus = 'A' GROUP BY proceso) AS z ON proceso = a.id LEFT JOIN (SELECT proceso, SUM(CASE WHEN estado <= 50 THEN 1 ELSE 0 END) AS totall_2, SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS espera_2, SUM(CASE WHEN estado = 50 THEN 1 ELSE 0 END) AS proceso_2, SUM(CASE WHEN estado = 20 THEN 1 ELSE 0 END) AS stock_2, SUM(CASE WHEN estado = 80 THEN 1 ELSE 0 END) AS calidad_2 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' GROUP BY proceso) AS y ON y.proceso = a.id WHERE a.estatus = 'A' AND a.id IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE usuario = " + this.servicio.rUsuario().id + " AND tipo = 0) ORDER BY a.nombre ";
    if (this.servicio.rUsuario().operacion=="S")
    {
      sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL(z.capproceso, 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, IFNULL(y.totall_2, 0) AS totall, IFNULL(y.espera_2, 0) AS espera, IFNULL(y.stock_2, 0) AS stock, CASE WHEN a.capacidad_stock = 0 THEN 0 ELSE FLOOR((SELECT stock) / a.capacidad_stock * 100) END AS pctstock, IFNULL(y.proceso_2, 0) AS en_proceso, CASE WHEN (SELECT cap_proceso) = 0 THEN 0 ELSE FLOOR((SELECT en_proceso) / (SELECT cap_proceso) * 100) END AS pctproceso, IFNULL(y.calidad_2, 0) AS calidad FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN (SELECT proceso, SUM(capacidad) AS capproceso FROM " + this.servicio.rBD() + ".cat_maquinas WHERE estatus = 'A' GROUP BY prZoceso) AS z ON proceso = a.id LEFT JOIN (SELECT proceso, SUM(CASE WHEN estado <= 50 THEN 1 ELSE 0 END) AS totall_2, SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS espera_2, SUM(CASE WHEN estado = 50 THEN 1 ELSE 0 END) AS proceso_2, SUM(CASE WHEN estado = 20 THEN 1 ELSE 0 END) AS stock_2, SUM(CASE WHEN estado = 80 THEN 1 ELSE 0 END) AS calidad_2 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' GROUP BY proceso) AS y ON y.proceso = a.id WHERE a.estatus = 'A' ORDER BY a.nombre " ;
    }
    this.servicio.aEscanear(false);
      
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
      this.arrFiltrado = resp;
      this.arreHover.length = resp.length
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);  
        this.verBuscar = true;
        this.buscar();  
      }, 300);
      this.contarRegs()

    });
  }

  filtrar()
  {
    if (this.vista == 1)
    {
      this.procesos = this.aplicarFiltro(this.textoBuscar);
    }
    else if (this.vista == 3)
    {
      this.detalles = this.aplicarFiltro(this.textoBuscar);
    }
    this.contarRegs();    
  }

  aplicarFiltro(cadena: string) 
  {
    let tmpRegistros = [];
    this.servicio.activarSpinnerSmall.emit(true);
    if (cadena ) 
    {
      for (var i = 0; i < this.arrFiltrado.length; i  ++)
      {
        for (var j in this.arrFiltrado[i])
        {
          if (this.arrFiltrado[i][j])
          {
            if (this.servicio.tildes(this.arrFiltrado[i][j], "M").toLowerCase().indexOf(cadena.toLowerCase()) !== -1)
            {
              tmpRegistros.splice(tmpRegistros.length, 0, this.arrFiltrado[i]);
              break;
            }
          }
        }
      }
    }
    else
    {
      tmpRegistros = this.arrFiltrado;
    }
    this.servicio.activarSpinnerSmall.emit(false);
    return tmpRegistros;
  }

  contarRegs()
  {
    let mensaje = this.servicio.rTraduccion()[2825];
    let cadAdicional: string = (this.procesos.length != this.arrFiltrado.length ? this.servicio.rTraduccion()[2826] + this.arrFiltrado.length + ") " : "");
    if (this.vista == 1)
    {
      if (this.procesos.length > 0)
      {
        mensaje = this.servicio.rTraduccion()[66] + this.procesos.length + this.servicio.rTraduccion()[2827] + cadAdicional
      }
      this.servicio.mensajeInferior.emit(mensaje);          
    }
    else if (this.vista == 3)
    {
      cadAdicional = (this.detalles.length != this.arrFiltrado.length ? this.servicio.rTraduccion()[2826] + this.arrFiltrado.length + ") " : "");
      if (this.detalles.length > 0)
      {
        mensaje = (this.detalles.length == 1 ? this.servicio.rTraduccion()[2828] : this.detalles.length + this.servicio.rTraduccion()[2829]);
      }
      else
      {
        mensaje = this.servicio.rTraduccion()[2830]
      }
      mensaje = mensaje + cadAdicional + " => " + this.servicio.rTraduccion()[2582] + " '" + this.procesoSeleccionado.nombre + "'";

      this.servicio.mensajeInferior.emit(mensaje);
    }
  }

  imagenError(id: number)
  {
    //if (this.accion == "in")
    {
      this.procesos[id].mostrarImagen = "N";
      
    }
  }

  imagenErrorProceso(id: number)
  {
    //if (this.accion == "in")
    {
      this.procesoSeleccionado.mostrarImagen = "N";
      
    }
  }

  imagenErrorParte(id: number)
  {
    //if (this.accion == "in")
    {
      this.detalles[id].mostrarImagen = "N";
      
    }
  }

  imagenErrorLote()
  {
    //if (this.accion == "in")
    {
      this.detLote.mostrarImagen = "N";
      
    }
  }

  imagenErrorDetalle()
  {
    //if (this.accion == "in")
    {
      this.procesoSeleccionado.mostrarImagen = "N";
    }
  }


  cancelar()
  {
  }

  procesarPantalla(id: number)
  {

  }

  solicitarIdentificacion()
  {
    this.vista = 1;
    this.permiteBuscar = true;
    
    this.verImagen = false;
    this.verRegistro = 22;
    this.listarProcesos();
    
  }

  identificar(proceso: any)
  {
    this.servicio.aEscanear(true);
    this.procesoSeleccionado.id = proceso.id;
    this.procesoSeleccionado.nombre = proceso.nombre;
    this.procesoSeleccionado.referencia = proceso.referencia;
    this.procesoSeleccionado.mostrarImagen = "S";
    this.procesoSeleccionado.capacidad_proceso = (+proceso.enproceso > 0 ? proceso.enproceso + " / ": "") + proceso.capacidad_proceso;
    this.procesoSeleccionado.imagen = proceso.imagen;
    this.procesoSeleccionado.capacidad_stock =  (+proceso.enstock > 0 ? proceso.enstock + " / ": "") + proceso.capacidad_stock;
    this.procesoSeleccionado.capacidad_proceso_pct = Math.floor((+proceso.enproceso / +proceso.capacidad_proceso) * 100) + "%";
    this.procesoSeleccionado.capacidad_stock_pct = Math.floor((+proceso.enstock / +proceso.capacidad_stock) * 100) + "%";
    this.procesoSeleccionado.lotesEPAlarmados = 0;
    this.procesoSeleccionado.lotesEPPorAlarmar = 0;
    this.procesoSeleccionado.lotesESAlarmados = 0;
    this.procesoSeleccionado.lotesESPorAlarmar = 0;
    this.procesoSeleccionado.lotesEEAlarmados = 0;
    this.procesoSeleccionado.lotesEEPorAlarmar = 0;
    this.procesoSeleccionado.desde = new Date();
    this.vista = 2;
    this.cronometrando = false;
    this.permiteBuscar = false;
    this.verBuscar = false;
    this.verRegistro = 21;
    this.cadaSegundo();
  }

  estatusProceso()
  {
    this.buscarLotes(50);
    this.buscarLotes(51);
    //this.buscarLotes(20);
    this.buscarLotes(0);
    this.contarRegs();
  }

  cadaSegundo()
  {
    if (this.esperaDisparo > 0)
    {
      this.esperaDisparo = this.esperaDisparo - 1;
      let mensaje = "";
      if (this.esperaDisparo == 0)
      {
        this.disparoSiguiente = 0;
        mensaje = "0";
        setTimeout(() => {
          this.verEspera = false;
        }, 1000);
      }
      else
      {
        mensaje = '' + this.esperaDisparo ;
      }      
      this.detLote.tiempo = mensaje;
    }
    else
    {
      if (this.cronometrando || this.vista == 1 || this.procesoSeleccionado.id == 0) 
      {
        return;
      }
      this.cronometrando = true;
      let tiempo = this.servicio.tiempoTranscurrido(this.procesoSeleccionado.desde, "D").split(";");
      let strDias = tiempo[0];
      let strHoras = tiempo[1];
      let strMinutos = tiempo[2];
      if (+tiempo[0] == 0)
      {
        strDias = "";
      }
      if (+tiempo[1] < 10) 
      { 
        strHoras = '0' + tiempo[1];
      }
      if (+tiempo[2] < 10) 
      { 
        strMinutos = '0' + +tiempo[2];
      } 
      if (+tiempo[0] > 0)
      {
        strDias = +tiempo[0] + "d";
      }
      if ((+tiempo[0] + +tiempo[1] + +tiempo[2]) > 0)
      {
        this.tiempo = strDias + " " + (+tiempo[1] + +tiempo[2] > 0  ? (strHoras + ":" + strMinutos) : "") 
      }
      else
      {
        this.tiempo = this.servicio.rTraduccion()[2812]
      }
      if (this.vista == 2)
      {
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2810] + this.servicio.fecha(2,this.procesoSeleccionado.desde,this.servicio.rIdioma().fecha_05) + this.servicio.rTraduccion()[2811] + this.tiempo);  
        this.revisarLotes();
      }

      if (this.vista == 3)
      {

        let sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + this.tipoLote + " ORDER BY a.inspecciones DESC, 3, a.fecha;"
        if (this.tipoLote == 0)
        {
          this.estadoActual = this.servicio.rTraduccion()[2274]
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, 3, a.fecha;"
        }
        else if (this.tipoLote == 90)
        {
          this.estadoActual = this.servicio.rTraduccion()[144]
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, CASE WHEN a.estado = 20 THEN c.tiempo_stock ELSE c.tiempo_proceso END AS tiempo_proceso, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado < 90 ORDER BY a.inspecciones DESC, 3, a.fecha;"
        }
        else if (this.tipoLote == 20)
        {
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_stock, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + this.tipoLote + " ORDER BY a.inspecciones DESC, 3, a.fecha;"
          this.estadoActual = this.servicio.rTraduccion()[2276]
        }
        else if (this.tipoLote == 50)
        {
          this.estadoActual = this.servicio.rTraduccion()[2275]
        }
    
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {

          let actualizar: boolean = false; 
          actualizar = this.arrFiltrado.length != resp.length;
          if (!actualizar)
          {
            for (var i = 0; i < this.arrFiltrado.length; i++)
            {
              actualizar = this.arrFiltrado[i].id != resp[i].id
              if (actualizar)
              {
                break;
              }
              else
                {
                  if (this.arrFiltrado[i].hasta)
                  {
                    if (this.arrFiltrado[i].hasta != resp[i].hasta)
                    {
                      actualizar = true
                      break;
                    }
                  }
                  if (this.arrFiltrado[i].prioridad)
                  {
                    if (this.arrFiltrado[i].prioridad != resp[i].prioridad)
                    {
                      actualizar = true
                      break;
                    }
                  }
                }
            };
          }
          if (actualizar)
          {
            this.detalles = resp;
            this.arrFiltrado = resp;
          }

          Object.keys(this.detalles).forEach((elemento, index) => 
          {
            let segundos = [];
            if (this.detalles[index].hasta && this.detalles[index].estado != this.servicio.rTraduccion()[2274])
            {
              if (new Date(this.detalles[index].hasta) > new Date())
              {
                if (+this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.detalles[index].alarmado = "1";
                  this.detalles[index].titulo = this.servicio.rTraduccion()[2831];
                }
                else
                {
                  this.detalles[index].alarmado = "0";
                  this.detalles[index].titulo = this.servicio.rTraduccion()[2831];
                }
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "F").split(";");
              } 
              else
              {
                this.detalles[index].alarmado = "2";
                this.detalles[index].titulo = this.servicio.rTraduccion()[2832];
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "").split(";");
              }
            }
            else if (this.detalles[index].estado == this.servicio.rTraduccion()[2274])
            {
              console.log(new Date(this.detalles[index].fecha) + " " + new Date())
              if (new Date(this.detalles[index].fecha) > new Date())
              {
                this.detalles[index].tiempo = this.servicio.rTraduccion()[8];
                this.detalles[index].titulo = this.servicio.rTraduccion()[2874];
              }
              else
              {
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].fecha, "").split(";");
                this.detalles[index].titulo = this.servicio.rTraduccion()[153];
              }
            }
            else
            {
              this.detalles[index].tiempo = this.servicio.rTraduccion()[8];
              this.detalles[index].titulo = this.servicio.rTraduccion()[2874];
            }
            if (this.detalles[index].titulo != this.servicio.rTraduccion()[2874])
            {
              this.detalles[index].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            this.contarRegs();
          }); 
        });
      }
    }
    this.cronometrando = false;
  }

  buscarLotes(tipoLote: number)
  {
    let sentencia = "SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 50 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 20 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 0 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado <= 50;";

    if (tipoLote == 51)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS parte, a.fecha, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 50 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 6;"
    }
    else if (tipoLote == 20)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS parte, a.fecha, '0' AS alarmado, c.tiempo_stock, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 20 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 6;"
    }
    else if (tipoLote == 0)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS parte, a.fecha FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 6;"
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (tipoLote == 50)
      {
        this.procesoSeleccionado.lotes = resp[3].lotes;
        this.procesoSeleccionado.items = resp[3].partes;
        this.procesoSeleccionado.lotesEP = resp[0].lotes;
        this.procesoSeleccionado.itemsEP = resp[0].partes;
        this.procesoSeleccionado.lotesES = resp[1].lotes;
        this.procesoSeleccionado.itemsES = resp[1].partes;
        this.procesoSeleccionado.lotesEE = resp[2].lotes;
        this.procesoSeleccionado.itemsEE = resp[2].partes;
        this.procesoSeleccionado.calidad = resp[3].lotes;
        this.procesoSeleccionado.itemsEE = resp[2].partes;
      }
      else if (tipoLote == 51)
      {
        this.procesoSeleccionado.tmpLotesPorAlarmar = 0;
        this.procesoSeleccionado.tmpLotesAlarmados = 0;
        let actualizar: boolean = false; 
        actualizar = this.enProceso.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enProceso.length; i++)
          {
            actualizar = this.enProceso[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
              {
                if (this.enProceso[i].hasta || resp[i].hasta)
                {
                  if (this.enProceso[i].hasta != resp[i].hasta)
                  {
                    actualizar = true
                    break;
                  }
                  else
                  {
                    actualizar = this.enProceso[i].inspecciones != resp[i].inspecciones
                    if (actualizar)
                    {
                      break;
                    }
                  }
                }
              }
          };
        }
        if (actualizar)
        {
          this.enProceso = resp;
        }
        let lotesEPAlarmados = 0;
        let lotesEPPorAlarmar = 0;
        if (this.enProceso.length > 0 && this.vista == 2)
        {
          for (var i = 0; i < this.enProceso.length; i++)
          {
            let segundos = [];
            if (this.enProceso[i].hasta)
            {
              if (new Date(this.enProceso[i].hasta) > new Date())
              {
                
                if (+this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.enProceso[i].alarmado = "1";
                  lotesEPPorAlarmar = lotesEPPorAlarmar + 1;
                  this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
                }
                else
                {
                  this.enProceso[i].alarmado = "0";
                }
                segundos =  this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "F").split(";");
              } 
              else
              {
                this.enProceso[i].alarmado = "2";
                segundos =  this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "").split(";");
                lotesEPAlarmados = lotesEPAlarmados + 1; 
                this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
              }
              this.enProceso[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            else
            {
              this.enProceso[i].alarmado = "0";
              this.enProceso[i].tiempo =  this.servicio.rTraduccion()[8];
            }
          } 
        }
        if (lotesEPAlarmados != this.procesoSeleccionado.lotesEPAlarmados)
        {
          this.procesoSeleccionado.lotesEPAlarmados = lotesEPAlarmados; 
        }
        if (lotesEPPorAlarmar != this.procesoSeleccionado.lotesEPPorAlarmar)
        {
          this.procesoSeleccionado.lotesEPPorAlarmar = lotesEPPorAlarmar; 
        }
        
        sentencia = "SELECT a.id, a.numero, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS parte, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, a.fecha, '0' AS alarmado, c.tiempo_stock, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas d ON a.parte = d.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 20 ORDER BY a.inspecciones DESC, 4, a.fecha, a.id ASC LIMIT 6;"
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          let actualizar: boolean = false; 
          actualizar = this.enStock.length != resp.length;
          if (!actualizar)
          {
            for (var i = 0; i < this.enStock.length; i++)
            {
              actualizar = this.enStock[i].id != resp[i].id
              if (actualizar)
              {
                break;
              }
              else
              {
                if (this.enStock[i].hasta)
                {
                  if (this.enStock[i].hasta != resp[i].hasta)
                  {
                    actualizar = true
                    break;
                  }
                }
                if (this.enStock[i].prioridad)
                {
                  if (this.enStock[i].prioridad != resp[i].prioridad)
                  {
                    actualizar = true
                    break;
                  }
                  else
                {
                  actualizar = this.enStock[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
                }
              }
            };
          }
          if (actualizar)
          {
            this.enStock = resp;
          }
          let lotesESAlarmados = 0;
          let lotesESPorAlarmar = 0;
            
          if (this.enStock.length > 0 && this.vista == 2)
          {
            for (var i = 0; i < this.enStock.length; i++) 
            {
              let segundos = [];
              if (new Date(this.enStock[i].hasta) > new Date())
              {
                if (+this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.enStock[i].alarmado = "1";
                  lotesESPorAlarmar = lotesESPorAlarmar + 1;
                  this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
                }
                else
                {
                  this.enStock[i].alarmado = "0";
                }
                segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "F").split(";");
              } 
              else
              {
                this.enStock[i].alarmado = "2";
                segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "").split(";");
                lotesESAlarmados = lotesESAlarmados + 1; 
                this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
              }
              this.enStock[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            
          }
          if (lotesESAlarmados != this.procesoSeleccionado.lotesESAlarmados)
          {
            this.procesoSeleccionado.lotesESAlarmados = lotesESAlarmados;
          }
          if (lotesESPorAlarmar != this.procesoSeleccionado.lotesESPorAlarmar)
          {
            this.procesoSeleccionado.lotesESPorAlarmar = lotesESPorAlarmar;
          }
          if (this.procesoSeleccionado.tmpLotesAlarmados != this.procesoSeleccionado.lotesAlarmados)
          {
            this.procesoSeleccionado.lotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados;
          }
          if (this.procesoSeleccionado.tmpLotesPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar;
          }
        })


      }
      else if (tipoLote == 20)
      {
        let actualizar: boolean = false; 
        actualizar = this.enStock.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enStock.length; i++)
          {
            actualizar = this.enStock[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
            {
              if (this.enStock[i].hasta)
              {
                if (this.enStock[i].hasta != resp[i].hasta)
                {
                  actualizar = true
                  break;
                }
              }
              if (this.enStock[i].prioridad)
              {
                if (this.enStock[i].prioridad != resp[i].prioridad)
                {
                  actualizar = true
                  break;
                }
                else
                {
                  actualizar = this.enStock[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
         
              }
            }
          };
        }
        if (actualizar)
        {
          this.enStock = resp;
        }
        if (this.enStock.length > 0 && this.vista == 2)
        {
          let lotesESAlarmados = 0;
          let lotesESPorAlarmar = 0;
          for (var i = 0; i < this.enStock.length; i++) 
          {
            let segundos = [];
            if (new Date(this.enStock[i].hasta) > new Date())
            {
              if (+this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
              {
                this.enStock[i].alarmado = "1";
                lotesESPorAlarmar = lotesESPorAlarmar + 1;
                this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
              }
              else
              {
                this.enStock[i].alarmado = "0";
              }
              segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "F").split(";");
            } 
            else
            {
              this.enStock[i].alarmado = "2";
              segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "").split(";");
              lotesESAlarmados = lotesESAlarmados + 1; 
              this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
            }
            this.enStock[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
          }
          if (lotesESAlarmados != this.procesoSeleccionado.lotesESAlarmados)
          {
            this.procesoSeleccionado.lotesESAlarmados = lotesESAlarmados;
          }
          if (lotesESPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = lotesESPorAlarmar;
          }
          if (this.procesoSeleccionado.tmpLotesAlarmados != this.procesoSeleccionado.lotesAlarmados)
          {
            this.procesoSeleccionado.lotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados;
          }
          if (this.procesoSeleccionado.tmpLotesPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar;
          }
        }
      }
      else if (tipoLote == 0)
      {
        let actualizar: boolean = false; 
        actualizar = this.enEspera.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enEspera.length; i++)
          {
            actualizar = this.enEspera[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
            {
              if (this.enEspera[i].prioridad)
              {
                if (this.enEspera[i].prioridad != resp[i].prioridad)
                {
                  actualizar = true
                  break;
                }
                else
                {
                  actualizar = this.enEspera[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
              }
            }
          };
        }
        if (actualizar)
        {
          this.enEspera = resp;
        }
        if (this.enEspera.length > 0 && this.vista == 2)
        {
          for (var i = 0; i < this.enEspera.length; i++)
          {
            let segundos = [];
            if (new Date(this.enEspera[i].fecha) > new Date())
            {
              this.enEspera[i].tiempo = this.servicio.rTraduccion()[8];
            }
            else
            {
              segundos =  this.servicio.tiempoTranscurrido(this.enEspera[i].fecha, "").split(";");
              this.enEspera[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);  
            }
            
          }
        }
      }
    });
  }

  escapar()
  {
    if (this.verEspera)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[2813];
      mensajeCompleto.tiempo = 2500;
      this.servicio.mensajeToast.emit(mensajeCompleto);
    }
    else if (this.verBuscar)
    {
      this.buscar()
    }
    
  }

  buscar()
  {
    if (this.permiteBuscar)
    {
      setTimeout(() => {
        this.txtBuscar.nativeElement.focus();
      }, 100);
    }
  }

  refrescar()
  {
    if (this.vista == 3)
    {
      this.detalleProceso(this.tipoLote); 
    }
    else if (this.vista == 2)
    {
      this.resumen(); 
      
    }
    else if (this.vista == 1)
    {
      this.verRegistro = 2;
      this.listarProcesos(); 
      
    }
  }

  detalleProceso(tipoLote: number)
  {
    this.servicio.aEscanear(true);
    this.tipoLote = tipoLote;
    this.verRegistro = 23;
    this.permiteBuscar = true;
    this.vista = 3;
    this.detalles = [];
    this.servicio.activarSpinner.emit(true);    
    let sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + tipoLote + " ORDER BY a.inspecciones DESC, prioridad, a.fecha, a.id;"
    if (tipoLote == 0)
    {
      this.estadoActual = this.servicio.rTraduccion()[2274]
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
    }
    else if (tipoLote == 90)
    {
      this.estadoActual = this.servicio.rTraduccion()[144]
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, CASE WHEN a.estado = 20 THEN c.tiempo_stock ELSE c.tiempo_proceso END AS tiempo_proceso, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado < 90 ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
    }
    else if (tipoLote == 20)
    {
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estado, a.parte, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_stock, a.hasta FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + tipoLote + " ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
      this.estadoActual = this.servicio.rTraduccion()[2276]
    }
    else if (tipoLote == 50)
    {
      this.estadoActual = this.servicio.rTraduccion()[2275]
    }

    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2815];
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      this.detalles = resp;
      this.arrFiltrado = resp;
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);    
      }, 300);
      this.contarRegs()
    });
    
    this.cronometrando = false;
  }

  resumen()
  {
    this.detalles = [];
    this.servicio.aEscanear(true);
    this.servicio.activarSpinner.emit(true);  
    let sentencia = "SELECT id, imagen, referencia, nombre, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM " + this.servicio.rBD() + ".cat_maquinas WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 20 AND proceso = a.id AND estatus = 'A') AS enstock, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 AND proceso = a.id AND estatus = 'A') AS enproceso, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_procesos a WHERE id = " +  this.procesoSeleccionado.id + ";";
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.identificar(resp[0])
    })
    setTimeout(() => {
      this.servicio.activarSpinner.emit(false);    
    }, 300);
  }

  flujo(accion: number)
  {
    
  }

  validarEntrada(cadenaScaner: string)
  {
    let cadena = cadenaScaner.replace(/('|")/g, "");


    //Se valida que el lote exista en el sistema, que sea un código de scrap o que sea un código de inspección
    //sSe busca vía de Escape
    if (this.disparoSiguiente == 0)
    {
      let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".cat_situaciones WHERE referencia = '" + cadena + "'";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2816].replace("campo_0", resp.length).replace("campo_1", cadena);
          mensajeCompleto.tiempo = 6000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp.length == 1)
        {
          let boton1 = "";
          let icono1 = "";
          if (resp[0].tipo == 0)
          {
            this.detLote.subTitulo = this.servicio.rTraduccion()[2817];
            this.detLote.titulo = this.servicio.rTraduccion()[2643];
            boton1 = this.servicio.rTraduccion()[2644];
            icono1 = "iconshock-materialblack-general-cancel";
            this.accionCalidad = 0;
          }
          else if (resp[0].tipo == 50)
          {
            this.detLote.subTitulo = this.servicio.rTraduccion()[2818];
            this.detLote.titulo = this.servicio.rTraduccion()[2640];
            boton1 = this.servicio.rTraduccion()[2641];
            icono1 = "iconshock-materialblack-general-preview2";
            this.accionCalidad = 50;
          }
          this.causaInspeccion = resp[0].id;
          if (this.lote_inspeccion_clave == "S")
          {
            this.servicio.aEscanear(false);
            const respuesta = this.dialogo.open(DialogowipComponent, {
              width: "480px", panelClass: 'dialogo', data: { revision: 0, causaC: 0, causaD: resp[0].nombre + this.servicio.rTraduccion()[2637] + resp[0].referencia + ")", codigo: resp[0].id, claves: "", usuarioCalidad: 0, clave: "1", titulo: this.detLote.titulo, mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: boton1, icono1: icono1, boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "iconshock-materialblack-project-management-problems" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (!result)
              {
                this.servicio.aEscanear(true);
              }
              if (result.accion == 1) 
              {
                this.servicio.aEscanear(true);
                this.situacionCalidad = resp[0].nombre;
                this.esperaDisparo = this.tiempo_entre_lecturas;
                this.inspector = result.usuarioCalidad;
                this.disparoSiguiente = 10;
                this.verEspera = true;
  
                this.conLote = 2;
                
                this.detLote.literal = this.servicio.rTraduccion()[2819];
                this.detLote.producto = resp[0].nombre;
                this.detLote.numero = "";
                this.detLote.imagen = "";
                this.detLote.refproducto = "";
                this.detLote.mostrarImagen = "";
                this.detLote.fecha = "";
                this.detLote.estadoLote = "";
                this.detLote.tiempo = this.tiempo_entre_lecturas;
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-normal";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2639];
                mensajeCompleto.tiempo = 1500;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.servicio.aEscanear(true);
              }
            })
          }
          else
          {
            this.servicio.aEscanear(true);
            this.situacionCalidad = resp[0].nombre;
            this.esperaDisparo = this.tiempo_entre_lecturas;
            this.inspector = this.servicio.rUsuario().id;
            this.disparoSiguiente = 10;
            this.verEspera = true;

            this.conLote = 2;
            
            this.detLote.literal = this.servicio.rTraduccion()[2819];
            this.detLote.producto = resp[0].nombre;
            this.detLote.numero = "";
            this.detLote.imagen = "";
            this.detLote.refproducto = "";
            this.detLote.mostrarImagen = "";
            this.detLote.fecha = "";
            this.detLote.estadoLote = "";
            this.detLote.tiempo = this.tiempo_entre_lecturas;
          }
          
        } 
        else
        {
          let sentencia = "SELECT reverso_permitir FROM " + this.servicio.rBD() + ".configuracion WHERE reverso_referencia = '" + cadena + "'";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp.length > 0)
            {
              if (resp[0].reverso_permitir == "N")
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2820];
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
              else if (resp[0].reverso_permitir == "S")
              {
                this.loteNumeroMover = cadena;
                this.loteEstado = resp[0].estado;
                this.loteMover = resp[0].id;
                this.parteMover = resp[0].parte;
                this.ultimaSecuencia = resp[0].secuencia;
                this.esperaDisparo = this.tiempo_entre_lecturas;
                this.disparoSiguiente = 50;
                this.verEspera = true;
                
                this.conLote = 2;
                this.detLote.titulo = this.servicio.rTraduccion()[2821];
                this.detLote.numero = resp[0].numero;
                this.detLote.producto = "";
                this.detLote.literal = "";
                this.detLote.imagen = resp[0].imagen;
                this.detLote.refproducto = resp[0].refproducto;
                this.detLote.mostrarImagen = resp[0].mostrarImagen;
                this.detLote.fecha = resp[0].fecha;
                this.detLote.estadoLote = resp[0].estadoLote;
                this.mensajeBase = "";
                
                this.detLote.subTitulo = this.servicio.rTraduccion()[2822];
                this.detLote.tiempo = this.tiempo_entre_lecturas;
              }
              else if (resp[0].reverso_permitir == "C")
              {
                this.validarOpcion(295);                
              }
            }
            else
            {
              sentencia = "SELECT a.*, d.nombre AS rdnombre, e.referencia as refproducto, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' END as estadoLote, b.nombre, e.nombre as producto, e.imagen, 'S' as mostrarImagen, c.nombre as nruta, c.inicia, (SELECT MAX(secuencia) FROM " + this.servicio.rBD() + ".ruta_congelada WHERE lote = a.id) AS finaliza, (SELECT secuencia FROM " + this.servicio.rBD() + ".ruta_congelada WHERE lote = a.id AND secuencia > a.ruta_secuencia ORDER BY secuencia LIMIT 1) as secuencia_siguiente FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_rutas c ON a.ruta = c.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas d ON a.ruta_detalle = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes e ON a.parte = e.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
              campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                if (resp.length > 0)
                {
                  if (resp[0].estado == 90)
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "snack-error";
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2823].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].rechazo, this.servicio.rIdioma().fecha_02));
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 80)
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "snack-error";
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2824].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].rechazo, this.servicio.rIdioma().fecha_02));
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && +resp[0].finaliza == +resp[0].ruta_secuencia)
                  {
                    //Fin del proceso
                    sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 99, alarma_tse = 'N', alarma_tpe = 'N', finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_salida = NOW(), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)) WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
                    let campos = {accion: 200, sentencia: sentencia};  
                    this.servicio.consultasBD(campos).subscribe( resp =>
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "snack-normal";
                      mensajeCompleto.mensaje = this.servicio.rTraduccion()[2833].replace("campo_0", cadena);
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);
                      this.cadaSegundo();
                      this.procesarBackflush(resp[0].id, this.procesoAnterior);
                    })
                  }   
                  else if (resp[0].estado == 50 && resp[0].proceso == this.procesoSeleccionado.id && this.tipo_flujo!="E")
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "snack-error";
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2834].replace("campo_0", cadena);
                    mensajeCompleto.tiempo = 3000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && resp[0].proceso != this.procesoSeleccionado.id && this.tipo_flujo=="E")
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "snack-error";
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2835].replace("campo_0", cadena).replace("campo_1", resp[0].rdnombre);
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && resp[0].proceso == this.procesoSeleccionado.id && this.tipo_flujo=="E")
                  {
                    this.loteNumeroMover = cadena;
                    this.loteEstado = resp[0].estado;
                    this.rutaActual = resp[0].ruta;
                    this.ultimaRutaDetalle = resp[0].ruta_detalle
                    this.loteMover = resp[0].id;
                    this.parteMover = resp[0].parte;
                    this.ultimaSecuencia = resp[0].ruta_secuencia;
                    this.esperaDisparo = this.tiempo_entre_lecturas;
                    this.disparoSiguiente = 20;
                    this.verEspera = true;
                    
                    this.conLote = 1;
                    this.detLote.titulo = this.servicio.rTraduccion()[2236];
                    this.detLote.numero = resp[0].numero;
                    this.detLote.producto = resp[0].producto;
                    this.detLote.literal = "";
                    this.detLote.imagen = resp[0].imagen;
                    this.detLote.refproducto = resp[0].refproducto;
                    this.detLote.mostrarImagen = resp[0].mostrarImagen;
                    this.detLote.fecha = resp[0].fecha;
                    this.detLote.estadoLote = resp[0].estadoLote;
                    this.mensajeBase = "";
                    
                    this.detLote.subTitulo = this.servicio.rTraduccion()[2822];
                    this.detLote.tiempo = this.tiempo_entre_lecturas;
                  }
                  else if (resp[0].estado == 50 && this.tipo_flujo=="J")
                  {
                    let sentencia = "SELECT a.secuencia, b.nombre FROM " + this.servicio.rBD() + ".ruta_congelada a LEFT JOIN " + this.servicio.rBD() + ".det_rutas b ON a.id_detruta = b.id WHERE a.proceso = " + this.procesoSeleccionado.id + " AND a.ruta = " + resp[0].ruta + " ORDER BY a.secuencia DESC LIMIT 1;";
                    let campos = {accion: 100, sentencia: sentencia};  
                    this.servicio.consultasBD(campos).subscribe( respRuta =>
                    {
                      if (respRuta.length==0)
                      {
                        let mensajeCompleto: any = [];
                        mensajeCompleto.clase = "snack-error";
                        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2837].replace("campo_0", cadena).replace("campo_1", resp[0].nruta);
                        mensajeCompleto.tiempo = 4000;
                        this.servicio.mensajeToast.emit(mensajeCompleto);
                      }
                      else if (+respRuta[0].secuencia <= +resp[0].ruta_secuencia)
                      {
                        let mensajeCompleto: any = [];
                        mensajeCompleto.clase = "snack-error";
                        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2838].replace("campo_0", cadena);
                        mensajeCompleto.tiempo = 4000;
                        this.servicio.mensajeToast.emit(mensajeCompleto);
                      }
                      else
                      {
                        let sentencia = "SELECT a.id_detruta AS id, a.secuencia, b.nombre FROM " + this.servicio.rBD() + ".ruta_congelada a LEFT JOIN " + this.servicio.rBD() + ".det_rutas b ON a.id_detruta = b.id WHERE a.proceso = " + this.procesoSeleccionado.id + " AND a.ruta = " + resp[0].ruta + " AND a.secuencia > " + resp[0].ruta_secuencia + " ORDER BY a.secuencia LIMIT 1;";
                        let campos = {accion: 100, sentencia: sentencia};  
                        this.servicio.consultasBD(campos).subscribe( respRuta =>
                        {
                          let alarma= "N";
                          if (+respRuta[0].secuencia != +resp[0].secuencia_siguiente)
                          {
                            alarma = "S";
                          }
                          let cadNuevoLote = ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + resp[0].id + ", " + resp[0].parte + ", " + resp[0].ruta + ", " + respRuta[0].id + ", " + respRuta[0].secuencia + ", " + this.procesoSeleccionado.id + ", NOW(), " + resp[0].ruta_detalle + ", " + resp[0].ruta_secuencia + ", " + resp[0].proceso + ", '" + alarma + "');";
                          
                          sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, equipo = 0, alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW(), ruta_secuencia = " + respRuta[0].secuencia + ", ruta_detalle = " + respRuta[0].id + ", proceso = " + this.procesoSeleccionado.id + ", hasta = NULL WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + cadNuevoLote;
                          let campos = {accion: 200, sentencia: sentencia};  
                          this.servicio.consultasBD(campos).subscribe( dato =>
                          {
                            let mensajeCompleto: any = [];
                            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2839].replace("campo_0", cadena);
                            mensajeCompleto.clase = "snack-normal";
                            if (+respRuta[0].secuencia != +resp[0].secuencia_siguiente)
                            {
                              //elvis2
                              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2840].replace("campo_0", cadena);
                              mensajeCompleto.clase = "snack-error";
                             }
                            mensajeCompleto.tiempo = 4000;
                            this.servicio.mensajeToast.emit(mensajeCompleto);
                            this.cadaSegundo();
                            this.procesarBackflush(resp[0].id, this.procesoAnterior);
                          })
                        })
                      }  
                      
                    })
                  }
                  else if (resp[0].estado == 50 && this.tipo_flujo=="C")
                  {
                    this.loteNumeroMover = cadena;
                    this.loteEstado = resp[0].estado;
                    this.rutaActual = resp[0].ruta;
                    this.ultimaRutaDetalle = resp[0].ruta_detalle
                    this.loteMover = resp[0].id;
                    this.parteMover = resp[0].parte;
                    this.procesoAnterior = resp[0].proceso;
                    this.ultimaSecuencia = resp[0].ruta_secuencia;
                    this.esperaDisparo = this.tiempo_entre_lecturas;
                    this.disparoSiguiente = 60;
                    this.verEspera = true;
                    
                    this.conLote = 1;
                    this.detLote.titulo = this.servicio.rTraduccion()[2841];
                    this.detLote.numero = resp[0].numero;
                    this.detLote.producto = resp[0].producto;
                    this.detLote.literal = "";
                    this.detLote.imagen = resp[0].imagen;
                    this.detLote.refproducto = resp[0].refproducto;
                    this.detLote.mostrarImagen = resp[0].mostrarImagen;
                    this.detLote.fecha = resp[0].fecha;
                    this.detLote.estadoLote = resp[0].estadoLote;
                    this.mensajeBase = "";
                    
                    this.detLote.subTitulo = this.servicio.rTraduccion()[2842];
                    this.detLote.tiempo = this.tiempo_entre_lecturas;
                  } 
                  else if (resp[0].estado == 0 || resp[0].estado == 20)
                  {
                    if (resp[0].proceso == this.procesoSeleccionado.id)
                    {
                      this.loteNumeroMover = cadena;
                      this.loteEstado = resp[0].estado;
                      this.loteMover = resp[0].id;
                      this.parteMover = resp[0].parte;
                      this.ultimaSecuencia = resp[0].ruta_secuencia;
                      this.esperaDisparo = this.tiempo_entre_lecturas;
                      this.disparoSiguiente = 40;
                      this.verEspera = true;
                      
                      this.conLote = 1;
                      this.detLote.titulo = this.servicio.rTraduccion()[2843];
                      this.detLote.numero = resp[0].numero;
                      this.detLote.producto = resp[0].producto;
                      this.detLote.imagen = resp[0].imagen;
                      this.detLote.refproducto = resp[0].refproducto;
                      this.detLote.mostrarImagen = resp[0].mostrarImagen;
                      this.detLote.fecha = resp[0].fecha;
                      this.detLote.estadoLote = resp[0].estadoLote;
                      this.mensajeBase = this.servicio.rTraduccion()[2844];
                      
                      this.detLote.subTitulo = this.servicio.rTraduccion()[2845];
                      this.detLote.tiempo = this.tiempo_entre_lecturas;
                    }
                    else
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "snack-error";
                      mensajeCompleto.mensaje = this.servicio.rTraduccion()[2846].replace("campo_0", cadena).replace("campo_1", resp[0].rdnombre);
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);
                    }
                  }                       
                }            
                else
                //Buscar crear un nuevo lote
                {
                  let sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".det_rutas WHERE proceso = " + this.procesoSeleccionado.id + " AND secuencia = 1;";
                  let campos = {accion: 100, sentencia: sentencia};  
                  this.servicio.consultasBD(campos).subscribe( resp =>
                  {
                    if (resp[0].cuenta > 0)
                    {
                      this.loteNumeroMover = cadena;
                      this.ultimaSecuencia = resp[0].secuencia;
                      this.esperaDisparo = this.tiempo_entre_lecturas;
                      this.disparoSiguiente = 30;
                      this.verEspera = true;
                      this.conLote = 2;
                      this.detLote.titulo = this.servicio.rTraduccion()[2847]
                      this.detLote.numero = "";
                      this.detLote.producto = cadena;
                      this.detLote.literal = this.servicio.rTraduccion()[2848];
                      this.detLote.imagen = "";
                      this.detLote.refproducto = "";
                      this.detLote.mostrarImagen = "";
                      this.detLote.fecha = "";
                      this.detLote.estadoLote = "";;
                      this.detLote.subTitulo = this.servicio.rTraduccion()[2849];
                      this.detLote.tiempo = this.tiempo_entre_lecturas;
                      //this.servicio.aEscanear(true);
                    }
                    else
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "snack-error";
                      mensajeCompleto.mensaje = this.servicio.rTraduccion()[2850].replace("campo_0", cadena);
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);                  
                    }
                  });          
                }     
              });
            }
          })    
        }     
      })
    }
    else if (this.disparoSiguiente == 10)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      this.conLote = 0;
      let sentencia = "SELECT a.*, b.nombre FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2850].replace("campo_0", cadena);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 90)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2823].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].rechazo, this.servicio.rIdioma().fecha_02));
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 80)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2824].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].rechazo, this.servicio.rIdioma().fecha_02));
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2851].replace("campo_0", cadena).replace("campo_1", resp[0].nombre);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }    
        else
        {
          let adic = "";
          if (resp[0].estado == 20)
          {
            adic = "alarma_tse_paso = 'S', "
          }
          else if (resp[0].estado == 50)
          {
            adic = "alarma_tpe_paso = 'S', "
            // Rev Elvis this.procesarBackflush();
          }
          if (this.accionCalidad == 0)
          {
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 80, " + adic + "inspecciones = inspecciones + 1, inspeccion_id = " + this.causaInspeccion + ", inspeccionado_por = " + this.inspector + ", inspeccion = NOW() WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET inspecciones = inspecciones + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia
          }
          else
          {
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 90, " + adic + "rechazos = rechazos + 1, rechazo_id = " + this.causaInspeccion + ", rechazado_por = " + this.inspector + ", rechazo = NOW() WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET rechazos = rechazos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          sentencia = sentencia + ";INSERT INTO " + this.servicio.rBD() + ".calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + resp[0].id + ", " + resp[0].ruta_secuencia + ", " + this.accionCalidad + ", " + resp[0].parte + ", " + this.causaInspeccion + ", " + this.inspector + ", " + resp[0].proceso + ", " + resp[0].equipo + ", NOW());";
          
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2852].replace("campo_0", cadena).replace("campo_1", this.situacionCalidad);
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.cadaSegundo();
            
          })
        }  
      })
    }
    else if (this.disparoSiguiente == 20)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      if (cadena.toUpperCase() == this.procesoSeleccionado.referencia.toUpperCase())
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2853];
        mensajeCompleto.tiempo = 4000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      //Se busca la siguiente secuencia de la ruta
      let sentencia = "SELECT id_detruta AS id, secuencia FROM " + this.servicio.rBD() + ".ruta_congelada WHERE ruta = " + this.rutaActual + " AND secuencia > " + this.ultimaSecuencia + " ORDER BY secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        let sigSecuencia = resp[0].secuencia;

        sentencia = "SELECT a.id, a.nombre as n1, b.id_detruta AS id_det_ruta, b.ruta, c.nombre, b.secuencia FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN " + this.servicio.rBD() + ".ruta_congelada b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON b.id_detruta = c.id WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " ORDER BY b.secuencia LIMIT 1;";
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length == 0)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2854].replace("campo_0", cadena);
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (!resp[0].id_det_ruta)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2855].replace("campo_0", resp[0].n1);
            mensajeCompleto.tiempo = 6000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (+this.ultimaSecuencia > +sigSecuencia)
          {
            //elvis
            return;
            const respuesta = this.dialogo.open(DialogowipComponent, {
              width: "480px", panelClass: 'dialogo', data: { titulo: "Operación incongruente", mensaje: "Esta enviando al lote a una secuencia anterior, esto podría generar una alerta por SALTO DE OPERACIÓN. <br>¿Que desea hacer?", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: "Continuar con la transferencia", icono1: "iconshock-materialblack-general-check-mark", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "iconshock-materialblack-project-management-problems" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (result.accion == 1) 
              {
                let adcLoteH = "";
                if (resp[0].secuencia != this.ultimaSecuencia)
                {

                }
                let cadNuevoLote = ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada) VALUES (" + this.loteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW());";
                let adicional = "en la situación '" + this.servicio.rTraduccion()[2274] + "'"
                sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + resp[0].id + " WHERE id = " + this.loteMover + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_stock)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND proceso = " + this.procesoSeleccionado.id + cadNuevoLote;
                let campos = {accion: 200, sentencia: sentencia};  
                this.servicio.consultasBD(campos).subscribe( dato =>
                {
                  let mensajeCompleto: any = [];
                  mensajeCompleto.mensaje = this.servicio.rTraduccion()[2857].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
                  mensajeCompleto.clase = "snack-normal";
                  if (resp[0].secuencia != this.ultimaSecuencia)
                  {
                    //elvis incongruencia
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2858].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
                    mensajeCompleto.clase = "snack-error";
                  }
                  mensajeCompleto.tiempo = 7000;
                  this.servicio.mensajeToast.emit(mensajeCompleto);
                  this.cadaSegundo();
                })
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = "Se cancela la transferencia";
                mensajeCompleto.tiempo = 2500;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })      
          }
          else 
          {
            let alarma= "N";
            if (+resp[0].secuencia != +sigSecuencia)
            {
              alarma = "S";
            }
            let cadNuevoLote = ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + this.loteMover + ", " + this.parteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW(), " + this.ultimaRutaDetalle + ", " + this.ultimaSecuencia + ", " + this.procesoSeleccionado.id + ", '" + alarma + "');";
            let adicional = this.servicio.rTraduccion()[2856] + " '" + this.servicio.rTraduccion()[2274] + "'"
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, equipo = 0, alarma_tpe_paso = 'S', alarma_tse_paso = 'N', alarma_tse = 'N', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + resp[0].id + ", hasta = NULL WHERE id = " + this.loteMover + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + cadNuevoLote;
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( dato =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2857].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
              mensajeCompleto.clase = "snack-normal";
              if (+resp[0].secuencia != +sigSecuencia)
              {
                //elvis2
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2858].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
                mensajeCompleto.clase = "snack-error";
               }
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.cadaSegundo();
            })
          }
        })
      })
      //Se espera un codigo de proceso
      
    }
    else if (this.disparoSiguiente == 30)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      //Se espera un codigo de proceso
      let sentencia = "SELECT a.id, a.nombre, a.ruta, b.secuencia, b.id AS iddet_ruta FROM " + this.servicio.rBD() + ".cat_partes a INNER JOIN " + this.servicio.rBD() + ".det_rutas b ON a.ruta = b.ruta AND b.proceso = " + this.procesoSeleccionado.id + " INNER JOIN " + this.servicio.rBD() + ".cat_procesos c ON c.id = " + this.procesoSeleccionado.id + " WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' ORDER BY b.secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2859].replace("campo_0", cadena);
          mensajeCompleto.tiempo = 6000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2860].replace("campo_0", resp.length).replace("campo_1", cadena);
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].secuencia != 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2861];
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else 
        {
          sentencia = "INSERT INTO " + this.servicio.rBD() + ".lotes (numero, parte, fecha, proceso, ruta, ruta_detalle, ruta_secuencia, inicia, estado, creacion, creado) VALUES ('" + this.loteNumeroMover + "', " + resp[0].id + ", NOW(), " + this.procesoSeleccionado.id + ", " + resp[0].ruta + ", " + resp[0].iddet_ruta + ", " + resp[0].secuencia + ", NOW(), 0, NOW(), " + this.servicio.rUsuario().id + ")";
          let campos = {accion: 300, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            if (dato.substring(0, 1) == "A")
            {
              let loteID = +dato.substring(1, 10);
              
              let adicional = "en la situación '" + this.servicio.rTraduccion()[2274] + "'"
              sentencia = "INSERT INTO " + this.servicio.rBD() + ".ruta_congelada (lote, id_detruta, ruta, secuencia, proceso) SELECT " + loteID + ", id, ruta, secuencia, proceso FROM " + this.servicio.rBD() + ".det_rutas WHERE estatus = 'A' AND ruta = " + resp[0].ruta + ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada) VALUES (" + loteID + ", " + resp[0].id + ", " + resp[0].ruta + ", " + resp[0].iddet_ruta + ", " + resp[0].secuencia + ", " + this.procesoSeleccionado.id + ", NOW());";
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( dato =>
              {
                
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-normal";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2862].replace("campo_0", this.loteNumeroMover).replace("campo_1", adicional).replace("campo_2", resp[0].nombre);
                mensajeCompleto.tiempo = 5000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.cadaSegundo();
                //actualizar pantallas
              })
            }  
          })
        }
      })
    }
    else if (this.disparoSiguiente == 40)
    //Se espera un equipo;
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      let sentencia = "SELECT a.id, a.nombre, a.proceso, a.capacidad, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 and proceso = a.proceso AND equipo = a.id AND estatus = 'A') AS enproceso FROM " + this.servicio.rBD() + ".cat_maquinas a WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2875].replace("campo_0", cadena);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2863].replace("campo_0", resp.length).replace("campo_1", cadena);
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2864].replace("campo_0", resp[0].nombre);
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (+resp[0].capacidad <= +resp[0].enproceso)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2865].replace("campo_0", resp[0].nombre);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else 
        {
          let adicional = "UPDATE " + this.servicio.rBD() + ".lotes_historia SET equipo = " + resp[0].id + ", fecha_proceso = NOW(), tiempo_espera = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + ";"
          let adicSituacion = this.servicio.rTraduccion()[2274];
          if (this.loteEstado == 20)
          {
            adicional = "UPDATE " + this.servicio.rBD() + ".lotes_historia SET equipo = " + resp[0].id + ", fecha_proceso = NOW(), tiempo_stock = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_stock)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + ";"
            adicSituacion = this.servicio.rTraduccion()[2276];
          }
          //Nuevo para OEE
          let cadOEE = "UPDATE " + this.servicio.rBD() + ".cat_maquinas SET oee_lote_actual = " + this.loteMover + ", oee_parte_actual = (SELECT parte FROM " + this.servicio.rBD() + ".lotes WHERE id = " + this.loteMover + ") WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET iniciar_2 = 'S' WHERE equipo = " + resp[0].id + ";";
          //OEE 
          
          sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET hasta = NULL, equipo = " + resp[0].id + ", alarma_tse_paso = 'S', alarma_tpe_paso = 'N', alarma_tpe = 'N', estado = 50, calcular_hasta = '2', alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW() WHERE id = " + this.loteMover + ";" + adicional + cadOEE;
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2866].replace("campo_0", this.loteNumeroMover).replace("campo_1", adicSituacion).replace("campo_2", this.servicio.rTraduccion()[2275]).replace("campo_3", resp[0].nombre);
            mensajeCompleto.tiempo = 5000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.cadaSegundo();
          })
        }      
      })
    }
    else if (this.disparoSiguiente == 50)
    //Se espera un equipo;
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      this.conLote = 0;
      let sentencia = "SELECT a.*, b.nombre FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2850].replace("campo_0", cadena);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2851].replace("campo_0", cadena).replace("campo_1", resp[0].nombre);
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 90)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2867].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].rechazo, this.servicio.rIdioma().fecha_02));
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 80)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2868].replace("campo_0", cadena).replace("campo_1", this.servicio.fecha(2, resp[0].inspeccion, this.servicio.rIdioma().fecha_02));
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (+resp[0].estado > 0)
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, alarma_tse_paso = 'S', alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          if (resp[0].estado==20)
          {
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          else if (resp[0].estado==50)
          {
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2868].replace("campo_0", cadena).replace("campo_1", this.servicio.rTraduccion()[2274]);
            mensajeCompleto.tiempo = 5000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          })
        } 
        else 
        {
          sentencia = "SELECT a.proceso_anterior, a.ruta_detalle_anterior, a.ruta_secuencia_antes, b.nombre FROM " + this.servicio.rBD() + ".lotes_historia a LEFT JOIN " + this.servicio.rBD() + ".det_rutas b ON a.ruta_detalle_anterior = b.id WHERE a.lote = " + resp[0].id + " AND a.ruta_secuencia = " + resp[0].ruta_secuencia + " ORDER BY a.ruta_secuencia LIMIT 1;";
          campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( respSec =>
          {
            if (respSec.length==0)
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2870].replace("campo_0", cadena);
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {
              let mensaje = this.servicio.rTraduccion()[2871].replace("campo_0", cadena).replace("campo_0", respSec[0].nombre);
              if (+respSec[0].proceso_anterior > 0)
              { 
                sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0, proceso = " + respSec[0].proceso_anterior + ", ruta_detalle = " + respSec[0].ruta_detalle_anterior + ", ruta_secuencia = " + respSec[0].ruta_secuencia_antes + " WHERE id = " + resp[0].id + ";DELETE FROM " + this.servicio.rBD() + ".lotes_historia WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + respSec[0].ruta_secuencia_antes + ";";
              }
              else
              {
                sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estatus = 'I' WHERE id = " + resp[0].id + ";DELETE FROM " + this.servicio.rBD() + ".lotes_historia WHERE lote = " + resp[0].id + "";
                mensaje = this.servicio.rTraduccion()[2872].replace("campo_0", cadena);
              }
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = mensaje;
                mensajeCompleto.tiempo = 5000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.cadaSegundo();
              })
            }  
          });
        }   
      })
    }
    else if (this.disparoSiguiente == 60)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      if (cadena.toUpperCase() != this.procesoSeleccionado.referencia.toUpperCase())
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2873].replace("campo_0", this.procesoSeleccionado.nombre);
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      //Se busca la siguiente secuencia de la ruta
      let sentencia = "SELECT id_detruta AS id, secuencia FROM " + this.servicio.rBD() + ".ruta_congelada WHERE ruta = '" + this.rutaActual + "' AND secuencia > " + this.ultimaSecuencia + " ORDER BY secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let sentencia = "SELECT id_detruta AS id, secuencia FROM " + this.servicio.rBD() + ".ruta_congelada WHERE ruta = '" + this.rutaActual + "' AND secuencia < " + this.ultimaSecuencia + " ORDER BY secuencia LIMIT 1;";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp.length > 0)
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2874].replace("campo_0", cadena);
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            return;
          })
        }
        let sigSecuencia = resp[0].secuencia;

        //sentencia = "SELECT a.id, a.nombre as n1, b.id AS id_det_ruta, b.ruta, b.nombre, b.secuencia FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN " + this.servicio.rBD() + ".det_rutas b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " ORDER BY b.secuencia LIMIT 1;";
        sentencia = "SELECT a.id, a.nombre as n1, b.id_detruta AS id_det_ruta, b.ruta, c.nombre, b.secuencia FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN " + this.servicio.rBD() + ".ruta_congelada b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON b.id_detruta = c.id WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " AND b.lote = " + this.loteMover + " ORDER BY b.secuencia LIMIT 1;";
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length == 0)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2854].replace("campo_0", cadena);
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (!resp[0].id_det_ruta)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2855].replace("campo_0", resp[0].n1);
            mensajeCompleto.tiempo = 6000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          
          else 
          {

            
            let alarma= "N";
            if (+resp[0].secuencia != +sigSecuencia)
            {
              alarma = "S";
            }
            let cadNuevoLote = ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + this.loteMover + ", " + this.parteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW(), " + this.ultimaRutaDetalle + ", " + this.ultimaSecuencia + ", " + this.procesoAnterior + ", '" + alarma + "');";
            let adicional = "en la situación '" + this.servicio.rTraduccion()[2274] + "'"
            
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, equipo = 0, alarma_tpe_paso = 'S', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + this.procesoSeleccionado.id + ", hasta = NULL WHERE id = " + this.loteMover + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + cadNuevoLote;
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( dato =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2857].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
              mensajeCompleto.clase = "snack-normal";
              if (+resp[0].secuencia != +sigSecuencia)
              {
                //elvis2
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2858].replace("campo_0", this.loteNumeroMover).replace("campo_1", resp[0].nombre).replace("campo_2", adicional);
                mensajeCompleto.clase = "snack-error";
               }
              this.procesarBackflush(this.loteMover, this.procesoAnterior)
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.cadaSegundo();
            })
          }
        })
      })
      //Se espera un codigo de proceso
      
    }
  }


  revisarLotes()
  {
    //Se recorren los arreglos
    let sentencia = "SELECT id, imagen, referencia, nombre, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM " + this.servicio.rBD() + ".cat_maquinas WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 20 and proceso = a.id AND estatus = 'A') AS enstock, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 and proceso = a.id AND estatus = 'A') AS enproceso, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_procesos a WHERE id = " +  this.procesoSeleccionado.id + ";";
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesoSeleccionado.nombre = resp[0].nombre;
      this.procesoSeleccionado.referencia = resp[0].referencia;
      this.procesoSeleccionado.capacidad_proceso = (+resp[0].enproceso > 0 ? resp[0].enproceso + " / ": "") + resp[0].capacidad_proceso;
      this.procesoSeleccionado.capacidad_stock =  (+resp[0].enstock > 0 ? resp[0].enstock + " / ": "") + resp[0].capacidad_stock;
      if (+resp[0].capacidad_proceso > 0)
      {
        this.procesoSeleccionado.capacidad_proceso_pct = Math.floor((+resp[0].enproceso / +resp[0].capacidad_proceso) * 100) + "%";
      }
      else
      {
        this.procesoSeleccionado.capacidad_proceso_pct = "0%";
      }
      if (+resp[0].capacidad_stock > 0)
      {
        this.procesoSeleccionado.capacidad_stock_pct = Math.floor((+resp[0].enstock / +resp[0].capacidad_stock) * 100) + "%";
      }
      else
      {
        this.procesoSeleccionado.capacidad_stock_pct = "0%";
      }
      this.estatusProceso();      
    })
  }

  configuracion()
  {
    this.servicio.consultasBD({accion: 100, sentencia: "/configuracion/10"}).subscribe( resp =>
    {
      if (resp && resp.length > 0)
      {
        this.tiempo_entre_lecturas = +resp[0].tiempo_entre_lecturas; 
        this.tiempo_entre_lecturas = (this.tiempo_entre_lecturas==0 ? 10 : this.tiempo_entre_lecturas);
        this.salto_adelante = resp[0].wip_salto_adelante == "S";
        this.salto_atras = resp[0].wip_salto_detras == "S";
        this.lote_inspeccion_clave = resp[0].lote_inspeccion_clave;
        this.tipo_flujo = resp[0].tipo_flujo;
        this.tiempoAlerta = +resp[0].avisar_segundos;
        this.configuracionBF = resp[0].kanban_backflush == "S";
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  validarOpcion(opcion: number) 
  {
    if (this.servicio.rUsuario().id == 0)
    {
      this.sesion(opcion);
    }
    else
    {
      if (this.servicio.rUsuario().rol== "A")
      {
        if (opcion == 295)
        {
          this.seguirReverso();
        }
      }
      else
      {
        let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".relacion_usuarios_opciones WHERE usuario = " + this.servicio.rUsuario().id + " AND opcion = " + opcion;
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length > 0)
          {
            if (opcion == 295)
            {
              this.seguirReverso();
            }
          }
          else
          {
            this.sesion(opcion);
          }
        })
      }
    }
}

sesion(opcion: number)
{
  this.servicio.aEscanear(false);
  const respuesta = this.dialogo.open(SesionComponent, 
    {
      width: "400px", panelClass: 'dialogo', data: { tiempo: 10, sesion: 1, rolBuscar: "", opcionSel: opcion, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[266], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[122], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        if (result.accion == 1) 
        {
          if (opcion == 295)
            {
              this.seguirReverso();
            }
        }
        else 
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[253];
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[253];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    });
  }

  seguirReverso()
  {
    //this.loteNumeroMover = cadena;
    //this.loteEstado = resp[0].estado;
    //this.loteMover = resp[0].id;
    //this.ultimaSecuencia = resp[0].secuencia;
    this.esperaDisparo = this.tiempo_entre_lecturas;
    this.disparoSiguiente = 50;
    this.verEspera = true;
    
    this.conLote = 2;
    this.detLote.titulo = this.servicio.rTraduccion()[2821];
    //this.detLote.numero = resp[0].numero;
    this.detLote.producto = "";
    this.detLote.literal = "";
    //this.detLote.imagen = resp[0].imagen;
    //this.detLote.refproducto = resp[0].refproducto;
    //this.detLote.mostrarImagen = resp[0].mostrarImagen;
    //this.detLote.fecha = resp[0].fecha;
    //this.detLote.estadoLote = resp[0].estadoLote;
    this.mensajeBase = "";
    
    this.detLote.subTitulo = this.servicio.rTraduccion()[2822];
    this.detLote.tiempo = this.tiempo_entre_lecturas;
    this.servicio.aEscanear(true);
      
  }

  nada(id: number)
  {
    
  }

  procesarBackflush(miLote: number, procesoAnterior: number)
  {
    //Se procesa el backflush de la operación (si aplica)
    if (!this.configuracionBF)
    {
      return;
    }
    let sentencia = "SELECT a.id FROM " + this.servicio.rBD() + ".cat_procesos a WHERE a.id = " + procesoAnterior + " AND a.estatus = 'A' AND a.kanban = 'S' AND a.kanban_backflush = 'S'"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length == 0)
      {
        //El proceso no soporta backflush
        return;        
      }
      else
      {

        sentencia = "SELECT a.ruta_detalle, a.parte, a.numero, a.id FROM " + this.servicio.rBD() + ".lotes a WHERE a.id = " + miLote;
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( lote =>
        {
          //Se busca si hay backFlush para el producto que se está procesando
          let sentencia = "SELECT a.*, b.saldo, c.url_mmcall AS unidadtexto FROM " + this.servicio.rBD() + ".det_rutas_backflush a INNER JOIN " + this.servicio.rBD() + ".relacion_operaciones_partes b ON a.parte = b.parte AND b.proceso = " + procesoAnterior + " LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON b.unidad = c.id WHERE a.ruta_id = " + this.ultimaRutaDetalle + " AND a.padre = " + lote[0].parte + " AND a.usar = 'S' AND a.cantidad > 0"
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp.length == 0)
            {
              //No hay backflush activo para el producto
              return;  
            }
            for (let i = 0; i < resp.length ; i++)
            {
              //Se buscan las características del item
              //Se permitirán negativos ¿? SI
              //Se aplican los movimientos de Kanban, validando existencias
              sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_movimientos (fecha, clase, tipo, saldo_ubicacion_antes, parte, proceso, cantidad, usuario, transaccion, referencia, unidad, notas, turno) VALUES(NOW(), 1, 'C', " + +resp[i].saldo + ", " + +resp[i].parte + ", " + +procesoAnterior + ", " + +resp[i].cantidad + ", " + this.servicio.rUsuario().id + ", " + miLote + ", '" +  lote[0].numero + "', '" + resp[i].unidadtexto + "', '" + this.servicio.rTraduccion()[4129] + "', " + this.servicio.rTurno().id + ");UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET saldo = saldo - " + +resp[i].cantidad + " WHERE proceso = " + +procesoAnterior + " AND parte = " + +resp[i].parte
              campos = {accion: 200, sentencia: sentencia}; 
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                let entregado = true;
              })
            }
          })
        })
      }
    })

  }


  
}