import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart, Router } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DialogowipComponent } from '../dialogowip/dialogowip.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ViewportRuler } from "@angular/cdk/overlay";
import { DatePipe } from '@angular/common'
import { CdkDrag, CdkDragStart, CdkDropList, CdkDropListGroup, CdkDragMove, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-flujo',
  templateUrl: './flujo.component.html',
  styleUrls: ['./flujo.component.css'],
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


export class FlujoComponent implements OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("lstParte", { static: false }) lstParte: MatSelect;
  @ViewChild("lstParte2", { static: false }) lstParte2: MatSelect;
  @ViewChild("lstParte3", { static: false }) lstParte3: MatSelect;
  @ViewChild("lstParte4", { static: false }) lstParte4: MatSelect;
  @ViewChild("lstProceso", { static: false }) lstProceso: MatSelect;
  @ViewChild("txtFecha", { static: false }) txtFecha: ElementRef;
  @ViewChild("txtCarga", { static: false }) txtCarga: ElementRef;
  @ViewChild("txtDesde", { static: false }) txtDesde: ElementRef;
  @ViewChild("txtCantidad", { static: false }) txtCantidad: ElementRef;
  @ViewChild(CdkDropListGroup, { static: false }) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, { static: false }) placeholder: CdkDropList;

  scrollingSubscription: Subscription;
  vistaCatalogo: Subscription;
  //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";  
  URL_FOLDER = "/sigma/assets/datos/";  
  
  constructor
  (
    public servicio: ServicioService,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private viewportRuler: ViewportRuler,
    public datepipe: DatePipe,
    private router: Router,
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
    this.emit40 = this.servicio.cambioIdioma.subscribe((data: boolean)=>
    {
      if (this.router.url.substr(0, 6) == "/flujo")
      {
        this.adecuar();
      }
    })
    this.emit50 = this.servicio.teclaBuscar.subscribe((accion: boolean)=>
    {
      this.buscar();
    });
    this.emit60 = this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.cancelar();
    });
    this.emit70 = this.vistaCatalogo = this.servicio.vista.subscribe((vista: number)=>
    {
      this.maestroActual = vista - 2010;
      this.nivelActual = 0;
      if (this.maestroActual == 0) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[2511], icono: "i_programacion"} ];
      }
      else if (this.maestroActual == 1) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[508], icono: "i_prioridades"} ];
      }
      else if (this.maestroActual == 2) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 3) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 4) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
      }
      
      this.pantalla = 2;
      this.verRegistro = (this.verRegistro != 0 ? 1 : 0);  
      this.noAnimar = this.servicio.rHuboError();
      this.procesarPantalla(1);
    });
    this.emit80 = this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.maestroActual = this.servicio.rVista() - 2010;
    this.nivelActual = 0
    if (this.maestroActual == 0) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[2511], icono: "i_programacion"} ];
      }
      else if (this.maestroActual == 1) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[508], icono: "i_prioridades"} ];
      }
      else if (this.maestroActual == 2) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 3) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 4) 
      {
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
      }
    this.indices = [{ nombre: this.servicio.rTraduccion()[2513], icono: "i_programacion"} ];
    this.procesarPantalla(1);  
    this.validarTabla();
  }

  nombreReg: string = "";
  botonera: any = [false, true, true, true, true, true, false, true, true, true, true]
  ayuda01: string = this.servicio.rTraduccion()[1781]
  ayuda02: string = this.servicio.rTraduccion()[1783]
  ayuda03: string = this.servicio.rTraduccion()[1787]
  ayuda04: string = this.servicio.rTraduccion()[1784]
  ayuda05: string = this.servicio.rTraduccion()[1778]
  ayuda06: string = this.servicio.rTraduccion()[1779]
  ayuda07: string = this.servicio.rTraduccion()[1785]
  ayuda08: string = this.servicio.rTraduccion()[1782]
  ayuda09: string = this.servicio.rTraduccion()[1792]
  ayuda10: string = this.servicio.rTraduccion()[1788]
  ayuda11: string = this.servicio.rTraduccion()[1789]
  ayuda12: string = this.servicio.rTraduccion()[1790]
  ayuda13: string = this.servicio.rTraduccion()[1791]
  ayuda14: string = this.servicio.rTraduccion()[1775]
  ayuda15: string = this.servicio.rTraduccion()[2507]
  ayuda16: string = this.servicio.rTraduccion()[2509]
  ayuda17: string = this.servicio.rTraduccion()[2506]
  ayuda18: string = this.servicio.rTraduccion()[2508]
  ayuda19: string = this.servicio.rTraduccion()[2510]
  error01: boolean = false;
  error02: boolean = false;
  error05: boolean = false;
  cadenaAntes: string = "";
  lotesF: any = [];
  lotes: any = [];

  sentenciaRtit: string = "";
  sentenciaR: string = "";

  titulos: any = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
  
  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;
  
  soloStock: boolean = true;
  hayFiltro: boolean = true;
  noLeer: boolean = true;
  soloActivas: boolean = true;
  seleccion: number = 0;
  alarmados: number = 0;

  resecuenciar: boolean = false;
  botonera1: number = 1;
  vision: number = 0;
  cubiertas: number = 0;
  saltos: number = 0;
  cadHistorico: string = "";
  actual: number = 0;
  vistaDetalle: number = 0;
  pantallaAnterior: number = 0;

  bot1Sel: boolean = false;
  bot2Sel: boolean = false;
  genSec: boolean = false;
  bot3Sel: boolean = false;
  bot4Sel: boolean = false;
  bot5Sel: boolean = false;
  bot6Sel: boolean = false;
  bot7Sel: boolean = false;
  bot8Sel: boolean = false;
  bot9Sel: boolean = false;
  bot10Sel: boolean = false;


  segStock: string = this.servicio.rTraduccion()[371];
  segProceso: string = this.servicio.rTraduccion()[371];
  segSetup: string = this.servicio.rTraduccion()[371];
  estatusActual: string = "";
  secuenciaActual: string = "";
  iconoGeneral = "i_partes";
  titulo_fecha: string = "";
  titulo_lote: string = "";
  cancelarEdicion: boolean = false;

  //URL_BASE = "http://localhost:8081/sigma/api/upload.php";
  //URL_IMAGENES = "http://localhost:8081/sigma/assets/imagenes/";

  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";

  estadoArriba: string = "desaparecer";
  mensajeImagen: string = this.servicio.rTraduccion()[358];

  faltaMensaje: string = "";
  despuesBusqueda: number = 0;
  mostrarImagenRegistro: string = "N";
  verIrArriba: boolean = false;
  verBarra: string = "auto";
  nombreRuta: string = "";
  offSet: number;
  registroActual: number = 0;
  copiandoDesde: number = 0;
  idNivel0: number = 0;
  idNivel1: number = 0;
  idNivel2: number = 0;
  nivelActual: number = 0;
  textoBuscar: string = "";
  detalleRegistro: any = [];
  verBuscar: boolean = true;
  noAnimar: boolean = false;  
  verImagen: boolean = false;
  editando: boolean = false;
  verRegistro: number = 0;
  tiempoRevision: number = 5000;
  historicos = [];
  arreHover: any = [];
  arreHover2: any = [];
  arreHover3: any = [];
  arreHover4: any = [];
  arreHover5: any = [];
  arreHover6: any = [];
  arreHover7: any = [];
  arreHover8: any = [];
  
  
  nuevoRegistro: string = ";"
  maestroActual: number = 0;
  altoPantalla: number = this.servicio.rPantalla().alto - 105;
  anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
  errorTitulo: string = "[" + this.servicio.rTraduccion()[6] + "]";
  errorMensaje: string = "";
  pantalla: number = 2;

  literalSingular: string = "";
  literalSingularArticulo: string = "";
  literalPlural: string = "";
  
  actualizarMaestro: boolean = false;
  
  edicion: boolean = true;
  registros: any = [];
  secuencias: any = [];
  arrFiltrado: any = [];
  partes: any = [];
  cargas: any = [];
  procesos: any = [];
  cabProcesos: any = [];
  listas: any = [];
  indices: any = [{ nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"} ]
  cronometro: any;
  

  ngAfterViewInit() {
  }

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

    if (this.emit00) {this.emit00.unsubscribe()}
    if (this.emit10) {this.emit10.unsubscribe()}
    if (this.emit20) {this.emit20.unsubscribe()}
    if (this.emit30) {this.emit30.unsubscribe()}
    if (this.emit40) {this.emit40.unsubscribe()}
    if (this.emit50) {this.emit50.unsubscribe()}
    if (this.emit60) {this.emit60.unsubscribe()}
    if (this.emit70) {this.emit70.unsubscribe()}
    if (this.emit80) {this.emit80.unsubscribe()}
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

  irArriba() 
  {
    this.verIrArriba = false;
    document.querySelector('[cdkScrollable]').scrollTop = 0;    
  }

  miScroll(data: CdkScrollable) 
  {
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

  ascendenteID(a, b)
  {
    let comparison = 0;
    if (+a.id > +b.id) {
      comparison = 1;
    } else if (+a.id < +b.id) {
      comparison = -1;
    }
    return comparison;
  }

  llenarRegistros()
  {
    this.registros = [];
    this.verImagen = false;
    this.arreHover = [];
    this.arreHover3 = [];
    this.arreHover4 = [];
    this.arreHover2 = [];
    let mensajeNoHay = "";
    this.servicio.activarSpinner.emit(true);       
    let sentencia =   "SELECT a.id, a.completada, IFNULL(a.fecha, '" + this.servicio.rTraduccion()[8] + "') AS fecha, a.reprogramaciones, IFNULL(SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(a.fecha, a.fecha_anterior))), 0) AS sumado, CONCAT('Carga # ', IFNULL(a.carga, '')) AS nombre, IFNULL(z.tpartes, 0) AS partes, IFNULL(z.tprogramas, 0) AS programas, IFNULL(tcantidad, 0) AS piezas, IFNULL(y.tlotes1, 0) AS avance, IFNULL(X.tlotes2, 0) AS avancec, CASE WHEN (SELECT piezas) = 0 THEN 0 ELSE FLOOR((SELECT avance) / (SELECT piezas) * 100) END AS pct, CASE WHEN (SELECT piezas) = 0 THEN 0 ELSE FLOOR((SELECT avancec) / (SELECT piezas) * 100) END AS pctc, IFNULL(d.capacidad, 0) AS capacidad, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS equipo, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END AS estatus, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON a.equipo = d.id LEFT JOIN (SELECT carga, COUNT(*) AS tprogramas, COUNT(DISTINCT(parte)) AS tpartes, SUM(cantidad) AS tcantidad FROM " + this.servicio.rBD() + ".programacion WHERE estatus = 'A' GROUP BY carga) AS z ON z.carga = a.id LEFT JOIN (SELECT carga, COUNT(*) AS tlotes1 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' GROUP BY carga) AS y ON y.carga = a.id LEFT JOIN (SELECT carga, COUNT(*) AS tlotes2 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND equipo > 0) AS X ON X.carga = a.id " + (this.soloActivas ? "WHERE a.completada <> 'Y'" : "") + " ORDER BY a.fecha, a.carga";
    this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2566] + "', '" + this.servicio.rTraduccion()[754] + "', '" + this.servicio.rTraduccion()[704] + "', '" + this.servicio.rTraduccion()[2245] + "', '" + this.servicio.rTraduccion()[2567] + "', '" + this.servicio.rTraduccion()[2568] + "', '" + this.servicio.rTraduccion()[2569] + "', '" + this.servicio.rTraduccion()[2570] + "', '" + this.servicio.rTraduccion()[2240] + "', '" + this.servicio.rTraduccion()[2571] + "', '" + this.servicio.rTraduccion()[2572] + "', '" + this.servicio.rTraduccion()[568] + "', '" + this.servicio.rTraduccion()[2573] + "', '" + this.servicio.rTraduccion()[2574] + "', '" + this.servicio.rTraduccion()[707] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2576] + "', '" + this.servicio.rTraduccion()[2577] + "', '" + this.servicio.rTraduccion()[2571] + "', '" + this.servicio.rTraduccion()[2578] + "'";
    this.sentenciaR = "SELECT a.id, a.carga, CASE WHEN a.completada = 'Y' THEN '" + this.servicio.rTraduccion()[2297] + "' WHEN a.completada = 'U' THEN '" + this.servicio.rTraduccion()[2298] + "' WHEN a.completada = 'S' THEN '" + this.servicio.rTraduccion()[2299] + "' WHEN a.completada = 'N' THEN '" + this.servicio.rTraduccion()[1207] + "' END, a.notas, a.fecha, a.fecha_anterior, a.reprogramaciones, a.fecha_original, IFNULL((SELECT COUNT(DISTINCT(parte)) FROM " + this.servicio.rBD() + ".programacion WHERE carga = a.id AND estatus = 'A'), 0), IFNULL((SELECT SUM(cantidad) FROM " + this.servicio.rBD() + ".programacion WHERE carga = a.id AND estatus = 'A' ), 0) AS piezas, IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND carga = a.id), 0) AS avance, CASE WHEN (SELECT piezas) = 0 THEN 0 ELSE FLOOR((SELECT avance) / (SELECT piezas) * 100) END, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND carga = a.id AND equipo > 0), 0) AS avancec, CASE WHEN (SELECT piezas) = 0 THEN 0 ELSE FLOOR((SELECT avancec) / (SELECT piezas) * 100) END, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.cantidad, IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND carga = a.id AND parte = b.id), 0), IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND carga = a.id AND parte = b.id AND equipo > 0), 0) FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".programacion c ON a.id = c.carga LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON c.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON a.equipo = d.id" + (this.soloActivas ? " WHERE a.completada <> 'Y'" : "");
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      mensajeNoHay = this.servicio.rTraduccion()[2514]
      this.titulo_fecha = this.servicio.rTraduccion()[2245]
      this.iconoGeneral = "i_programacion";
      this.nuevoRegistro = this.servicio.rTraduccion()[2523]
      this.literalSingular = this.servicio.rTraduccion()[2525]
      this.literalPlural = this.servicio.rTraduccion()[2511]
      this.literalSingularArticulo = this.servicio.rTraduccion()[2538]
      this.nombreReg = "";
    }
    else if (this.maestroActual == 0 && this.nivelActual==1)
    {
      sentencia = "SELECT a.id, a.cantidad, IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND parte = a.parte AND carga = a.carga), 0) AS avance, CASE WHEN a.cantidad = 0 THEN 0 ELSE FLOOR((SELECT avance) / a.cantidad * 100) END as pct, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, d.referencia, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END AS estatus, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio, b.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".programacion a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id WHERE a.carga = " + this.idNivel0 + " ORDER BY d.nombre";
      this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2566] + "', '" + this.servicio.rTraduccion()[704] + "', '" + this.servicio.rTraduccion()[2245] + "', '" + this.servicio.rTraduccion()[2567] + "', '" + this.servicio.rTraduccion()[2568] + "', '" + this.servicio.rTraduccion()[2569] + "', '" + this.servicio.rTraduccion()[2570] + "', '" + this.servicio.rTraduccion()[2240] + "', '" + this.servicio.rTraduccion()[2579] + "', '" + this.servicio.rTraduccion()[2580] + "', '" + this.servicio.rTraduccion()[568] + "', '" + this.servicio.rTraduccion()[707] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2576] + "', '" + this.servicio.rTraduccion()[2577] + "'";
      this.sentenciaR = "SELECT a.id, a.carga, a.notas, a.fecha, a.fecha_anterior, a.reprogramaciones, a.fecha_original, IFNULL((SELECT COUNT(DISTINCT(parte)) FROM " + this.servicio.rBD() + ".programacion WHERE carga = a.id AND estatus = 'A'), 0), IFNULL((SELECT SUM(cantidad) FROM " + this.servicio.rBD() + ".programacion WHERE carga = a.id AND estatus = 'A'), 0) AS piezas, IFNULL((SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND carga = a.id), 0) AS avance, CASE WHEN (SELECT piezas) = 0 THEN 0 ELSE FLOOR((SELECT avance) / (SELECT piezas) * 100) END, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END, b.referencia, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.cantidad FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".programacion c ON a.id = c.carga LEFT JOIN " + this.servicio.rBD() + ".cat_partes b ON c.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON a.equipo = d.id";
      mensajeNoHay=this.servicio.rTraduccion()[2518]
      this.iconoGeneral = "i_partes";
      this.nuevoRegistro = this.servicio.rTraduccion()[1796]
      this.literalSingular = this.servicio.rTraduccion()[728]
      this.literalPlural = this.servicio.rTraduccion()[505];
      this.literalSingularArticulo = this.servicio.rTraduccion()[1235]
      this.nombreReg = "";
    }
    if (this.maestroActual == 1) 
    {
      mensajeNoHay=this.servicio.rTraduccion()[2519]
      sentencia = "SELECT a.id, a.fecha, d.nombre, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, a.orden, d.referencia, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END AS estatus, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio, d.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".prioridades a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id ORDER BY a.orden, a.fecha, d.nombre";
      this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2576] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2581] + "', '" + this.servicio.rTraduccion()[2582] + "', '" + this.servicio.rTraduccion()[2583] + "', '" + this.servicio.rTraduccion()[704] + "', '" + this.servicio.rTraduccion()[707] + "'";
      this.sentenciaR = "SELECT a.id, d.referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.orden, a.fecha, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado <= 50 AND estatus = 'A' AND estado <= 50 AND proceso = a.proceso AND estatus = 'A'), a.notas, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END FROM " + this.servicio.rBD() + ".prioridades a LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id";
      
      this.titulo_fecha = this.servicio.rTraduccion()[2522]
      this.iconoGeneral = "i_prioridades";
      this.nuevoRegistro = this.servicio.rTraduccion()[2524]
      this.literalSingular = this.servicio.rTraduccion()[2131]
      this.literalPlural = this.servicio.rTraduccion()[508]
      this.literalSingularArticulo = this.servicio.rTraduccion()[2539]
      this.nombreReg = "";
    }
    if (this.maestroActual == 2) 
    {
      this.titulo_lote = this.servicio.rTraduccion()[2532]
      mensajeNoHay=this.servicio.rTraduccion()[2516]
      sentencia = "SELECT a.id, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CONCAT('LOTE/OP: ', a.numero) AS nombre, a.numero AS elote, a.inspeccion as fecha, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS causa, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(c.referencia, '" + this.servicio.rTraduccion()[8] + "') AS causaref, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio, a.proceso, a.ruta_secuencia FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.inspeccionado_por = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones c ON a.inspeccion_id = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id WHERE a.estado = 80 ORDER BY 2, a.fecha, a.numero";
      this.sentenciaRtit =   "SELECT '" + this.servicio.rTraduccion()[763] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2576] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2584] + "', '" + this.servicio.rTraduccion()[2585] + "', '" + this.servicio.rTraduccion()[2586] + "', '" + this.servicio.rTraduccion()[2587] + "', '" + this.servicio.rTraduccion()[2582] + "', '" + this.servicio.rTraduccion()[2588] + "'";
      this.sentenciaR = "SELECT a.numero, d.referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 0), a.inspeccion, IFNULL(c.referencia, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.ruta_secuencia FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.inspeccionado_por = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones c ON a.inspeccion_id = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id WHERE a.estado = 80";
      this.titulo_fecha = this.servicio.rTraduccion()[2520]
      this.iconoGeneral = "i_inspeccion";
      this.nuevoRegistro = "";
      this.literalSingular = this.servicio.rTraduccion()[2528]
      this.literalPlural = this.servicio.rTraduccion()[2530]
      this.literalSingularArticulo = this.servicio.rTraduccion()[2536]
      this.nombreReg = "";
      
    }

    if (this.maestroActual == 3) 
    {
      this.titulo_lote = this.servicio.rTraduccion()[2533]
      mensajeNoHay=this.servicio.rTraduccion()[2517]
      sentencia = "SELECT a.id, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CONCAT('LOTE/OP: ', a.numero) AS nombre, a.numero AS elote, a.rechazo as fecha, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS causa, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(c.referencia, '" + this.servicio.rTraduccion()[8] + "') AS causaref, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio, a.proceso, a.ruta_secuencia FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.rechazado_por = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones c ON a.rechazo_id = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id WHERE a.estado = 90 ORDER BY 2, a.fecha, a.numero";
      this.sentenciaRtit =   "SELECT '" + this.servicio.rTraduccion()[763] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2576] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2589] + "', '" + this.servicio.rTraduccion()[2590] + "', '" + this.servicio.rTraduccion()[2533] + "', '" + this.servicio.rTraduccion()[2591] + "', '" + this.servicio.rTraduccion()[2582] + "', '" + this.servicio.rTraduccion()[2588] + "'";
      this.sentenciaR = "SELECT a.numero, d.referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 0), a.rechazo, IFNULL(c.referencia, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.ruta_secuencia FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.rechazado_por = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones c ON a.rechazo_id = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id WHERE a.estado = 90";
      this.titulo_fecha = this.servicio.rTraduccion()[2521]
      this.iconoGeneral = "i_rechazo";
      this.nuevoRegistro = "";
      this.literalSingular = this.servicio.rTraduccion()[2529]
      this.literalPlural = this.servicio.rTraduccion()[2531]
      this.literalSingularArticulo = this.servicio.rTraduccion()[2537]
      this.nombreReg = "";  
    }
    if (this.maestroActual == 4 && (this.vision==0 || this.vistaDetalle==1)) 
    {
      mensajeNoHay=this.servicio.rTraduccion()[2515]
      let adicional = " a.estado <> 99 AND a.estatus = 'A'";
      if (this.vistaDetalle==1)
      {
        if (this.vision==1)
        {
          adicional = " a.estado <> 99 AND a.estatus = 'A' AND a.proceso = " + this.idNivel1;
        }
        else if (this.vision==2)
        {
          adicional = " a.estado <> 99 AND a.estatus = 'A' AND (a.equipo = " + this.idNivel1 + " AND a.estado = 50)";
        }
        else if (this.vision==3)
        {
          adicional = " a.estado <> 99 AND a.estatus = 'A' AND a.parte = " + this.idNivel1;
        }
        else if (this.vision==4)
        {
          adicional = " a.estatus = 'A' AND a.estado = " + this.idNivel1;
        }
      }
      sentencia = "SELECT a.inicia, a.carga, IFNULL(f.carga, '" + this.servicio.rTraduccion()[8] + "') AS ncarga, a.finaliza, a.estimada, '" + this.servicio.rTraduccion()[1154] + "' as estatus, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, a.id, a.numero, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN '" + this.servicio.rTraduccion()[2616] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as estado, a.ruta_secuencia, a.fecha, a.hasta AS hasta, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cargas f ON a.carga = f.id WHERE " + adicional + " ORDER BY a.inspecciones DESC, 5, a.fecha, a.numero;";
      this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2592] + "', '" + this.servicio.rTraduccion()[2575] + "', '" + this.servicio.rTraduccion()[2593] + "', '" + this.servicio.rTraduccion()[2594] + "', '" + this.servicio.rTraduccion()[2595] + "', '" + this.servicio.rTraduccion()[2150] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2582] + "', '" + this.servicio.rTraduccion()[2596] + "', '" + this.servicio.rTraduccion()[1897] + "', '" + this.servicio.rTraduccion()[754] + "', '" + this.servicio.rTraduccion()[2135] + "', '" + this.servicio.rTraduccion()[2597] + "', '" + this.servicio.rTraduccion()[2598] + "', '" + this.servicio.rTraduccion()[2599] + "', '" + this.servicio.rTraduccion()[2139] + "', '" + this.servicio.rTraduccion()[2600] + "', '" + this.servicio.rTraduccion()[2601] + "', '" + this.servicio.rTraduccion()[2602] + "', '" + this.servicio.rTraduccion()[2603] + "', '" + this.servicio.rTraduccion()[2604] + "', '" + this.servicio.rTraduccion()[2301] + "', '" + this.servicio.rTraduccion()[2300] + "'";
      this.sentenciaR = "SELECT a.id, a.numero, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.inicia, a.finaliza, a.estimada, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 0) AS prioridad, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.ruta_secuencia, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN 'En Inspeccion' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as estado, a.inspecciones, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.inspeccion, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.rechazos, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.rechazo, IFNULL(i.nombre, '" + this.servicio.rTraduccion()[8] + "'), j.carga, a.alarmas, CASE WHEN a.alarma_tse = 'S' THEN '" + this.servicio.rTraduccion()[1891] + "' ELSE '" + this.servicio.rTraduccion()[1892] + "' END, CASE WHEN a.alarma_tpe = 'S' THEN '" + this.servicio.rTraduccion()[1891] + "' ELSE '" + this.servicio.rTraduccion()[1892] + "' END FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios i ON a.rechazado_por = i.id LEFT JOIN " + this.servicio.rBD() + ".cargas j ON a.carga = j.id WHERE " + adicional + " ";
      this.titulo_fecha = this.servicio.rTraduccion()[2521]
      this.iconoGeneral = "i_partes";
      this.nuevoRegistro = "";
      this.literalSingular = this.servicio.rTraduccion()[763]
      this.literalPlural = this.servicio.rTraduccion()[2240]
      this.literalSingularArticulo = this.servicio.rTraduccion()[2535]
    }
    else if (this.maestroActual == 4 && this.vision > 0 && this.vistaDetalle==0)
    {
      this.nombreReg = "";
      mensajeNoHay=this.servicio.rTraduccion()[2515]
      sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL(z.capproceso, 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, IFNULL(y.totall_2, 0) AS totall, IFNULL(y.espera_2, 0) AS espera, IFNULL(y.stock_2, 0) AS stock, IFNULL(y.proceso_2, 0) AS en_proceso, CASE WHEN a.capacidad_stock = 0 THEN 0 ELSE FLOOR((SELECT stock) / a.capacidad_stock * 100) END AS pctstock, CASE WHEN (SELECT cap_proceso) = 0 THEN 0 ELSE FLOOR((SELECT en_proceso) / (SELECT cap_proceso) * 100) END AS pctproceso, IFNULL(y.calidad_2, 0) AS calidad FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN (SELECT proceso, SUM(capacidad) AS capproceso FROM " + this.servicio.rBD() + ".cat_maquinas WHERE estatus = 'A' GROUP BY proceso) AS z ON z.proceso = a.id LEFT JOIN (SELECT proceso, SUM(CASE WHEN estado <= 50 THEN 1 ELSE 0 END) AS totall_2, SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS espera_2, SUM(CASE WHEN estado = 50 THEN 1 ELSE 0 END) AS proceso_2, SUM(CASE WHEN estado = 20 THEN 1 ELSE 0 END) AS stock_2, SUM(CASE WHEN estado = 80 THEN 1 ELSE 0 END) AS calidad_2 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' GROUP BY proceso) AS y ON y.proceso = a.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre;"
      
      this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2582] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[1716] + "', '" + this.servicio.rTraduccion()[1715] + "', '" + this.servicio.rTraduccion()[2289] + "', '" + this.servicio.rTraduccion()[2606] + "', '" + this.servicio.rTraduccion()[2607] + "', '" + this.servicio.rTraduccion()[2608] + "', '" + this.servicio.rTraduccion()[2609] + "', '" + this.servicio.rTraduccion()[2610] + "', '" + this.servicio.rTraduccion()[2611] + "'";
      this.sentenciaR = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM " + this.servicio.rBD() + ".cat_maquinas WHERE proceso = a.id AND estatus = 'A'), 0) AS cap_proceso, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado <= 50 AND estatus = 'A' AND proceso = a.id) AS totall, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 0 AND estatus = 'A' AND proceso = a.id), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 20 AND estatus = 'A' AND proceso = a.id) AS stock, CASE WHEN a.capacidad_stock = 0 THEN 0 ELSE FLOOR((SELECT stock) / a.capacidad_stock * 100) END, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 AND estatus = 'A' AND proceso = a.id) AS proceso, CASE WHEN (SELECT cap_proceso) = 0 THEN 0 ELSE FLOOR((SELECT proceso) / (SELECT cap_proceso) * 100) END, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 80 AND estatus = 'A' AND proceso = a.id) FROM " + this.servicio.rBD() + ".cat_procesos a " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
      if (this.vision==1)
      {
        this.literalSingular = this.servicio.rTraduccion()[1765]
        this.literalPlural = this.servicio.rTraduccion()[1771]
        this.literalSingularArticulo = this.servicio.rTraduccion()[1805]
        this.iconoGeneral = "i_procesos";    
      }
      else if (this.vision==2)
      {
        sentencia = "SELECT a.id, a.nombre, a.capacidad, a.proceso, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, 'S' AS mostrarImagen, a.referencia, IFNULL(z.tlotes, 0) AS totall, CASE WHEN a.capacidad = 0 THEN 0 ELSE FLOOR((SELECT totall) / a.capacidad * 100) END AS pctproceso FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id LEFT JOIN (SELECT equipo, COUNT(*) AS tlotes FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND estado = 50 GROUP BY equipo) AS z ON z.equipo = a.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre;";
        this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[568] + "', '" + this.servicio.rTraduccion()[2612] + "', '" + this.servicio.rTraduccion()[2613] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[2614] + "', '" + this.servicio.rTraduccion()[2609] + "', '" + this.servicio.rTraduccion()[2286] + "'";
        this.sentenciaR = "SELECT a.id, a.nombre, a.proceso, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.referencia, a.capacidad, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' AND estado = 50 AND equipo = a.id) AS totall, CASE WHEN a.capacidad = 0 THEN 0 ELSE FLOOR((SELECT totall) / a.capacidad * 100) END FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "i_maquina";
        this.literalSingular = this.servicio.rTraduccion()[568]
        this.literalPlural = this.servicio.rTraduccion()[588]
        this.literalSingularArticulo = this.servicio.rTraduccion()[1803]
      }
      else if (this.vision==3)
      {
        sentencia = "SELECT a.id, a.nombre, a.referencia, a.imagen, 'S' AS mostrarImagen, IFNULL(y.totall_2, 0) AS totall, IFNULL(y.espera_2, 0) AS espera, IFNULL(y.stock_2, 0) AS stock, IFNULL(y.proceso_2, 0) AS en_proceso, IFNULL(y.calidad_2, 0) AS calidad, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE carga <> 0 AND estado <= 50 AND estatus = 'A' AND parte = a.id) AS asignados  FROM " + this.servicio.rBD() + ".cat_partes a LEFT JOIN (SELECT parte, SUM(CASE WHEN estado <= 50 THEN 1 ELSE 0 END) AS totall_2, SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS espera_2, SUM(CASE WHEN estado = 50 THEN 1 ELSE 0 END) AS proceso_2, SUM(CASE WHEN estado = 20 THEN 1 ELSE 0 END) AS stock_2, SUM(CASE WHEN estado = 80 THEN 1 ELSE 0 END) AS calidad_2 FROM " + this.servicio.rBD() + ".lotes WHERE estatus = 'A' GROUP BY parte) AS y ON y.parte = a.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre;";
        this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2146] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[2289] + "', '" + this.servicio.rTraduccion()[2615] + "', '" + this.servicio.rTraduccion()[2606] + "', '" + this.servicio.rTraduccion()[2607] + "', '" + this.servicio.rTraduccion()[2609] + "', '" + this.servicio.rTraduccion()[2611] + "'";
        this.sentenciaR = "SELECT a.id, a.nombre, a.referencia, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado <= 50 AND estatus = 'A' AND parte = a.id) AS totall, (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE carga <> 0 AND estado <= 50 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 0 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 20 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 50 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".lotes WHERE estado = 80 AND estatus = 'A' AND parte = a.id) FROM " + this.servicio.rBD() + ".cat_partes a " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "i_partes";
        this.literalSingular = this.servicio.rTraduccion()[728]
        this.literalPlural = this.servicio.rTraduccion()[1269]
        this.literalSingularArticulo = this.servicio.rTraduccion()[1235]
      }
      else if (this.vision==4)
      {
        sentencia = "SELECT a.estado as id, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN '" + this.servicio.rTraduccion()[2616] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as nombre, COUNT(*) as totall, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".lotes a WHERE a.estatus = 'A' GROUP BY a.estado, 2 " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY 1;";
        this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[754] + "', '" + this.servicio.rTraduccion()[2240] + "'";
        this.sentenciaR = "SELECT a.estado as id, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN '" + this.servicio.rTraduccion()[2616] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as nombre, COUNT(*) AS totall FROM " + this.servicio.rBD() + ".lotes WHERE a.estatus = 'A' a GROUP BY a.estado, 2 " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "i_situaciones";
        this.literalSingular = this.servicio.rTraduccion()[2526]
        this.literalPlural = this.servicio.rTraduccion()[2527]
        this.literalSingularArticulo = this.servicio.rTraduccion()[2534]
      }
    }    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.registros = resp;
      this.arrFiltrado = resp;
      this.arreHover.length = resp.length;
      this.arreHover3.length = resp.length;
      this.arreHover4.length = resp.length;
      this.arreHover2.length = resp.length;
      this.contarRegs();
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        mensajeCompleto.mensaje = mensajeNoHay;
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);    
        this.txtBuscar.nativeElement.focus();
      }, 300);
    }, 
    error => 
      {
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);    
      })
  }

  adecuar()
  {
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      //0. Proceso origen de esta operación      
      this.titulos = [this.servicio.rTraduccion()[2146], this.servicio.rTraduccion()[2245], this.servicio.rTraduccion()[2556], this.servicio.rTraduccion()[2557], this.servicio.rTraduccion()[704], this.servicio.rTraduccion()[707], this.servicio.rTraduccion()[604], this.servicio.rTraduccion()[1818], this.servicio.rTraduccion()[1819], this.servicio.rTraduccion()[750], this.servicio.rTraduccion()[1820], this.servicio.rTraduccion()[2558], this.servicio.rTraduccion()[2559], this.servicio.rTraduccion()[2248], this.servicio.rTraduccion()[2560], this.servicio.rTraduccion()[2561], this.servicio.rTraduccion()[2562],   ]
      this.indices = [{ nombre: this.servicio.rTraduccion()[2511], icono: "i_programacion"} ];
    }
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      this.titulos = [this.servicio.rTraduccion()[728], this.servicio.rTraduccion()[2245], this.servicio.rTraduccion()[2556], this.servicio.rTraduccion()[2557], this.servicio.rTraduccion()[704], this.servicio.rTraduccion()[707], this.servicio.rTraduccion()[604], this.servicio.rTraduccion()[1818], this.servicio.rTraduccion()[1819], this.servicio.rTraduccion()[750], this.servicio.rTraduccion()[1820], this.servicio.rTraduccion()[2558], this.servicio.rTraduccion()[2559], this.servicio.rTraduccion()[2563]  ]
      this.indices = [{ nombre: this.servicio.rTraduccion()[2511], icono: "i_programacion"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"} ];
    }
    else if (this.maestroActual == 1)
    {
      this.titulos = [this.servicio.rTraduccion()[2146], this.servicio.rTraduccion()[2564], "", this.servicio.rTraduccion()[2565], this.servicio.rTraduccion()[704], this.servicio.rTraduccion()[707], this.servicio.rTraduccion()[604], this.servicio.rTraduccion()[1818], this.servicio.rTraduccion()[1819], this.servicio.rTraduccion()[750], this.servicio.rTraduccion()[1820], "" ]
      this.indices = [{ nombre: this.servicio.rTraduccion()[508], icono: "i_prioridades"} ];
    }
    else if (this.maestroActual == 4)
    {
      //0. Proceso origen de esta operación 
           
      this.titulos = [this.servicio.rTraduccion()[2146], this.servicio.rTraduccion()[2564], "", this.servicio.rTraduccion()[2565], this.servicio.rTraduccion()[704], this.servicio.rTraduccion()[707], this.servicio.rTraduccion()[604], this.servicio.rTraduccion()[1818], this.servicio.rTraduccion()[1819], this.servicio.rTraduccion()[750], this.servicio.rTraduccion()[1820], "" ]
    }
  }
  
  recuperar()
  {
    this.listarPartes();
    this.listarCargas();
    this.listarProcesos();
    this.llenarLotes();
    this.adecuar();
    let sentencia = "SELECT a.*, SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(a.fecha, a.fecha_anterior))) AS sumado, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(a.creacion, '" + this.servicio.rTraduccion()[8] + "') AS fcreacion, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucreacion, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
    
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      sentencia = "SELECT a.*, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(a.creacion, '" + this.servicio.rTraduccion()[8] + "') AS fcreacion, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucreacion, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".programacion a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
    }
    else if (this.maestroActual == 1)
    {
      this.listarCabProcesos()
      sentencia = "SELECT a.*, IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(a.creacion, '" + this.servicio.rTraduccion()[8] + "') AS fcreacion, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucreacion, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".prioridades a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.creado = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
    }
    else if (this.maestroActual == 4)
    {
      sentencia = "SELECT a.*, CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END AS estatus, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN '" + this.servicio.rTraduccion()[2616] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as estado, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nruta_detalle, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_causa, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS recha_causa, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_por, IFNULL(i.nombre, '" + this.servicio.rTraduccion()[8] + "') AS recha_por FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios i ON a.rechazado_por = i.id WHERE a.id = " + this.registroActual; 
    }
    this.arreHover4.length = this.indices.length;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        this.botonera1 = 2;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2540] + this.literalSingular);    
        this.detalleRegistro = resp[0];
        this.registroActual = resp[0].id;
        this.detalleRegistro.hora = this.servicio.fecha(2, this.detalleRegistro.fecha, "HH:mm")
        this.detalleRegistro.fecha = new Date(this.detalleRegistro.fecha)
        this.cancelarEdicion = false;
        this.mostrarImagenRegistro = "S";
        this.estatusActual = this.detalleRegistro.estatus;
        this.secuenciaActual = this.detalleRegistro.secuencia;
        this.botonera[3]= false;
        this.botonera[4]= this.detalleRegistro.estatus == "I";
        this.botonera[5]= false;
        this.copiandoDesde = 0;
        if (this.despuesBusqueda == 1)
        {
          this.copiandoDesde = this.detalleRegistro.id;
          this.registroActual = 0;
          this.mostrarImagenRegistro = "S";
          this.detalleRegistro.estatus = "A"
          this.botonera[1] = false;
          this.botonera[2] = false;
          this.editando = true;
          this.faltaMensaje = this.servicio.rTraduccion()[134]
          this.detalleRegistro.id = 0;
          this.detalleRegistro.fcambio = "";
          this.detalleRegistro.ucambio = "";
          this.detalleRegistro.fcreacion = "";
          this.detalleRegistro.ucreacion = "";
        }
        else
        {
          this.editando = false;
          this.botonera[1]= true;
          this.botonera[2]= true;
        }
        if (this.maestroActual==4)
        {
          this.historicos = [];
          //sentencia = "SELECT a.*, SEC_TO_TIME(a.tiempo_total) AS tiempoSEC, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nruta_detalle, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo FROM " + this.servicio.rBD() + ".lotes_historia a LEFT JOIN " + this.servicio.rBD() + ".det_rutas b ON a.ruta_detalle = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.equipo = c.id WHERE a.lote = " + this.registroActual + " ORDER BY a.id;"
          sentencia = "SELECT a.fecha_estimada, a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_salida, e.secuencia, IFNULL(a.id, 0) AS pasado, 1 AS salto, SEC_TO_TIME(a.tiempo_total) AS tiempoSEC, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nruta_detalle, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo FROM " + this.servicio.rBD() + ".ruta_congelada e LEFT JOIN " + this.servicio.rBD() + ".lotes_historia a ON e.lote = a.lote AND e.secuencia = a.ruta_secuencia LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON e.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.equipo = c.id WHERE e.lote = " + this.registroActual + " ORDER BY e.secuencia;"
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.cubiertas = 0;
            this.actual = 0;
            this.saltos = 0;
            let totales = 0;
            let blancos = 0;
            for (var i = 0 ; i < resp.length; i++)
            {
              totales = totales + 1;
              if (+resp[i].pasado > 0)
              {
                this.actual = i;
                this.saltos = blancos;
                this.cubiertas = totales;
                resp[i].salto = 0;
              }
              else
              {
                blancos = blancos + 1;
              }
            }  
            if (!resp[this.actual].fecha_salida)
            {
              this.cubiertas = this.cubiertas - 1;
            }
            
            this.cadHistorico = this.servicio.rTraduccion()[2541].replace("campo_0", Math.floor(this.cubiertas / resp.length * 100)).replace("campo_1", this.cubiertas + this.servicio.rTraduccion()[436] + resp.length).replace("campo_2", this.saltos);
            this.historicos = resp;
          });
        }
        setTimeout(() => {
          if (this.maestroActual==0 && this.nivelActual==1)
          {
            this.lstParte3.focus();
          }
          else if (this.maestroActual==0)
          {
            this.txtCarga.nativeElement.focus();
          }
          else
          {
            this.lstParte.focus();
          }
          
        }, 300);
    }, 
    error => 
      {
        console.log(error)
      })
  }

  buscarRegistro(accion: number)
  {
    let catalogo = "" + this.servicio.rBD() + ".cargas"
    if (this.nivelActual == 1) 
    {
      catalogo = "" + this.servicio.rBD() + ".programacion"
    }
    else if (this.maestroActual == 1) 
    {
      catalogo = "" + this.servicio.rBD() + ".prioridades"
    }
    let sentencia: string = "";
    if (accion == 1)
    {
      this.recuperar()
      return;
    }
    else
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(accion, 2);
        return;
      }
    }
    this.verRegistro = 22;
    if (accion == 2)
    {
      sentencia = "SELECT MIN(id) AS id FROM " + catalogo;
    }
    else if (accion == 3)
    {
      sentencia = " SELECT (SELECT id FROM " + catalogo + " WHERE id > " + this.registroActual + " ORDER BY id ASC LIMIT 1) AS id UNION ALL (SELECT MIN(id) FROM " + catalogo + ") ORDER BY 1 DESC LIMIT 1;"
    }
    else if (accion == 4)
    {
      sentencia  = " SELECT (SELECT MAX(id) FROM " + catalogo + ") AS id UNION ALL (SELECT id FROM " + catalogo + " WHERE id < " + this.registroActual + " ORDER BY 1 DESC LIMIT 1) ORDER BY 1 ASC LIMIT 1;"
    }
    else if (accion == 5)
    {
      sentencia = " SELECT MAX(id) AS id FROM " + catalogo;
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].id)
      {
        this.registroActual = resp[0].id;
        this.recuperar()
      }
      else
      {
        this.procesarPantalla(this.maestroActual)
      }
    })
    
  }

  revisar()
  {
    if (this.actualizarMaestro && this.verRegistro == 1)
    {
      
      let sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".actualizaciones WHERE cargas = 'S'";
      if (this.nivelActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".actualizaciones WHERE prioridades = 'S'";
      }
      else if (this.maestroActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".actualizaciones WHERE prioridades = 'S'";
      }
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp[0].cuenta > 0)
          {
            //Se revisa la tabla para 
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2554];
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.llenarRegistros();

            //Se actualiza la tabla
            sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET planes = 'N'";
            if (this.maestroActual == 1)
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET prioridades = 'N'";
            }
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
              {
                setTimeout(() => {
                  this.revisar()  
                }, +this.tiempoRevision);
              })
          }
        },
      error => 
        {
          console.log(error);
          setTimeout(() => {
            this.revisar()  
          }, +this.tiempoRevision);
        }
      )
      setTimeout(() => {
        this.revisar()  
      }, +this.tiempoRevision);
    }
  }

  
  contarRegs()
  {
    if (this.router.url.substr(0, 6) != "/flujo" )
    {
      return;
    }
    let mensaje = "";
    
    let cadAdicional: string = (this.registros.length != this.arrFiltrado.length ? this.servicio.rTraduccion()[65].replace("campo_0", this.arrFiltrado.length) : "");
    this.hayFiltro = this.registros.length != this.arrFiltrado.length;
    if (this.registros.length > 0)
    {
      mensaje = this.servicio.rTraduccion()[66] + (this.registros.length == 1 ? " un " + this.literalSingular : this.registros.length + " " + this.literalPlural) 
    }
    else
    {
      mensaje = this.servicio.rTraduccion()[67] + this.literalPlural
    }
    let cadAlarmas: string = "";
    {
      this.alarmados = 0;
      for (var i = 0; i < this.arrFiltrado.length; i++)
      {
        if (this.arrFiltrado[i].estatus == this.servicio.rTraduccion()[1155])
        {
          this.alarmados = this.alarmados + 1
        }
      }
      if (this.alarmados > 0)
      {
        cadAlarmas = "<span class='resaltar'>" + (this.alarmados == 1 ? this.servicio.rTraduccion()[1401] : this.alarmados + this.servicio.rTraduccion()[1402]) + "</span>";
      }
    }
    
    mensaje = mensaje + " " + cadAdicional + " " +  cadAlarmas
    this.servicio.mensajeInferior.emit(mensaje);          
  }
  
  imagenError(id: number)
  {
    //if (this.accion == "in")
    {
      this.registros[id].mostrarImagen = "N";
      
    }
  }

  imagenProcesada(id: number)
  {
    //if (this.accion == "in")
    {
      this.registros[id].mostrarImagen = "S";
      
    }
  }

  imagenErrorRegistro()
  {
    //if (this.accion == "in")
    {
      this.mostrarImagenRegistro = "N";
      this.mensajeImagen = this.servicio.rTraduccion()[1883]
    }
  }

  editar(i: number)
  {
    
    let id = this.registros[i].id; 
    if (this.maestroActual >= 2 && this.maestroActual < 4)
    {
      this.liberar(id);
    }
    else if (this.maestroActual == 4 && (this.vision==0 || this.vistaDetalle==1))
    {
      this.registroActual = id; 
      this.verRegistro = 22;
      this.recuperar();
    }
    else if (this.maestroActual == 4 && this.vision==1)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.nombreReg = this.registros[i].nombre;
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==2)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.idNivel2 = this.registros[i].proceso;
      this.verRegistro = 21;
      this.nombreReg = this.registros[i].nombre;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==3)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.idNivel2 = this.registros[i].proceso;
      this.nombreReg = this.registros[i].nombre;
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==4)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.nombreReg = this.registros[i].nombre;
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else
    {
      if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
      {
        const respuesta = this.dialogo.open(DialogowipComponent, {
          width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[2542], mensaje: this.servicio.rTraduccion()[2543], alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
        });
        return;
      }
      else
      {
        this.registroActual = id;    
        this.despuesBusqueda = 0;
        this.buscarRegistro(1);    
        this.verRegistro = 22;
      }
      
    }
  }

  salidaEfecto(evento: any)
  {
    if (evento.toState)
    {
      this.verRegistro = (this.verRegistro == 21 || this.verRegistro == 1 ? 1 : 2);
      
    }
  }

  procesarPantalla(id: number)
  {
    if (this.editando && !this.cancelarEdicion)
    {
      this.deshacerEdicion(id, 1)
      return;
    }   
    this.botonera1 = 1;
    this.verImagen = false;
    if (!this.noAnimar)
    {
      this.verRegistro = (this.verRegistro == 0 || this.verRegistro == 21 ? 1 : 21);  
    }
    else
    {
      this.verRegistro = 1;
    }  
    if (id == 1 && this.maestroActual == 0)
      {
        
        this.indices = [];
        this.nivelActual = 0;
        
        //this.servicio.mensajeSuperior.emit("Gestión de Programación")
      }
      else if (id == 1 && this.maestroActual == 1)
      {
        this.indices = [];
        
        //this.servicio.mensajeSuperior.emit("Gestión de Prioridades")
      }
      else if (id == 1 && this.maestroActual == 2)
      {
        this.indices = [];
        
        //this.servicio.mensajeSuperior.emit("Gestión de Lotes en inspección")
      }
      else if (id == 1 && this.maestroActual == 3)
      {
        this.indices = [];
        
        //this.servicio.mensajeSuperior.emit("Gestión de Lotes rechazados")
      }
      else if (id == 2 && this.maestroActual == 0)
      {
        
        this.indices = [{ nombre: this.servicio.rTraduccion()[2511], icono: "i_programacion"} ];
        
        //this.servicio.mensajeSuperior.emit("Gestión de Programación")
      }
      else if (id == 1 && this.maestroActual == 4)
      {
        this.vistaDetalle = 1;
        this.vision = 0;
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
        
        //this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 2 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 1;
        this.nivelActual = 0;
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
        //this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 3 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 2;
        this.nivelActual = 0;
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
        //this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 4 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 3;
        this.nivelActual = 0;
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
        //this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 5 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 4;
        this.nivelActual = 0;
        this.indices = [{ nombre: this.servicio.rTraduccion()[2512], icono: "i_prioridades"}, { nombre: this.servicio.rTraduccion()[1771], icono: "i_procesos"}, { nombre: this.servicio.rTraduccion()[588], icono: "i_maquina"}, { nombre: this.servicio.rTraduccion()[505], icono: "i_partes"}, { nombre: this.servicio.rTraduccion()[754], icono: "i_situaciones"}  ];
        //this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      if (this.maestroActual==4)
      {
        this.seleccion = id - 1;
      }
    this.llenarRegistros();
    this.revisar();
  }

  escapar()
  {
    this.buscar()
  }

  buscar()
  {
    setTimeout(() => {
      this.txtBuscar.nativeElement.focus();
    }, 50);
  }

  descargar()
  {
    let catalogo = this.servicio.rTraduccion()[2545]
    if (this.maestroActual == 0)
    {
      catalogo = this.servicio.rTraduccion()[2544]
    }
    else if (this.maestroActual == 1)
    {
      catalogo = this.servicio.rTraduccion()[508]
    }
    else if (this.maestroActual == 2)
    {
      catalogo = this.servicio.rTraduccion()[2546]
    }
    else if (this.maestroActual == 3)
    {
      catalogo = this.servicio.rTraduccion()[2551]
    }
    else if (this.maestroActual == 4 && this.vision==1) //Rutas de producción
    {
      catalogo = this.servicio.rTraduccion()[2550]
    }
    else if (this.maestroActual == 4 && this.vision==2) //Rutas de producción
    {
      catalogo = this.servicio.rTraduccion()[2547]
    }
    else if (this.maestroActual == 4 && this.vision==3) //Rutas de producción
    {
      catalogo = this.servicio.rTraduccion()[2549]
    }
    else if (this.maestroActual == 4 && this.vision==4) //Rutas de producción
    {
      catalogo = this.servicio.rTraduccion()[2548]
    }
    let campos = {accion: 110, sentencia: this.sentenciaRtit};  
    this.servicio.consultasBD(campos).subscribe( respTit =>
    {
      if (respTit.length > 0)
      {
        let campos = {accion: 110, sentencia: this.sentenciaR};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp. length > 0)
          {
            this.servicio.generarReporte(resp, catalogo, catalogo + ".csv", respTit)
          }
        })
      }
    });
  }

  writeContents(content, fileName, contentType) 
  {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  filtrar()
  {
    this.registros = this.aplicarFiltro(this.textoBuscar);
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
  
  cambiando(evento: any)
  {
    if (!this.editando)
    {
      this.botonera[1] = false;
      this.botonera[2] = false;
      this.botonera[3] = true;
      this.botonera[4] = true;
      this.botonera[5] = true;
      this.editando = true;
      this.faltaMensaje = this.servicio.rTraduccion()[134]
      this.detalleRegistro.fcambio = "";
      this.detalleRegistro.ucambio = "";
      this.cancelarEdicion = false;
    }
    if (evento.target)
    {
      if (evento.target.name)
      {
        if (evento.target.name == "imagen")
        {
          this.mostrarImagenRegistro = "S";
          this.mensajeImagen = this.servicio.rTraduccion()[358]
        }
      }
    }
  }
  
  cancelar()
  {
    if (!this.botonera[2])
    {
      this.edicionCancelada();              
      this.despuesBusqueda = 0;
      if (!this.registroActual)
      {
        this.inicializarPantalla();
        return;
      }
      else
      {
        this.buscarRegistro(1)
      }
    }
  }

  copiar()
  {
    if (!this.botonera[3])
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(0, 99)
        return;
      } 
      this.despuesBusqueda = 1;
      this.buscarRegistro(1);
      
    } 
  }

  validarEliminar()
  {
    let idBuscar = this.registroActual
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      //sentencia = "SELECT COUNT(*) AS totalr FROM " + this.servicio.rBD() + ".programacion WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    if (sentencia)
    {
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp && resp[0].totalr > 0)
        {
          let mensaje = this.servicio.rTraduccion()[2552].replace("campo_0", resp[0].totalr)
          if (this.maestroActual == 1)
          {
            mensaje = this.servicio.rTraduccion()[2553].replace("campo_0", resp[0].totalr)
          }
          const respuesta = this.dialogo.open(DialogowipComponent, {
            width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[388] + " " +this.literalSingular, mensaje: mensaje, alto: "80", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
          });
        }
        else
        {
          this.eliminar(idBuscar);
        }
      })
    }
    else
    {
      this.eliminar(idBuscar); 
    }
  }

  nuevo()
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[2542], mensaje: this.servicio.rTraduccion()[2555], alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
      });
      return;
    }
    else
    {
      this.verRegistro = 22;

      this.botonera1 = 2;
    
    this.listarCargas();
    this.listarCabProcesos()
    this.adecuar();
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      this.listarPartes();
    }
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      this.listarProcesos();
    }
    else if (this.maestroActual == 1)
    {

      this.indices = [{ nombre: this.servicio.rTraduccion()[508], icono: "i_prioridades"} ];
      this.titulos = [this.servicio.rTraduccion()[2146], this.servicio.rTraduccion()[2564], "", this.servicio.rTraduccion()[2565], this.servicio.rTraduccion()[704], this.servicio.rTraduccion()[707], this.servicio.rTraduccion()[604], this.servicio.rTraduccion()[1818], this.servicio.rTraduccion()[1819], this.servicio.rTraduccion()[750], this.servicio.rTraduccion()[1820], "" ]
      this.llenarLotes();
    }
    this.copiandoDesde = 0;
    this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2540] + this.literalSingular);    
    if (!this.botonera[0])
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(0, 99)
        return;
      } 
      this.despuesBusqueda = 0;
      //
      this.detalleRegistro.id = 0;
      this.detalleRegistro.parte = 0;
      this.detalleRegistro.loteID = -1;
      this.detalleRegistro.proceso = 1;
      this.detalleRegistro.cantidad = 1;
      this.detalleRegistro.permitir_reprogramacion = "S";
      this.detalleRegistro.alarma = "S";
      this.detalleRegistro.orden = 99999;
      this.detalleRegistro.notas = "";
      this.detalleRegistro.carga = "";
      if (this.nivelActual==1)
      {
        this.detalleRegistro.carga = this.idNivel0;
      }
      this.detalleRegistro.fecha = new Date();
      this.detalleRegistro.hora = this.servicio.fecha(1, "", "HH") + ":00";
      this.detalleRegistro.estatus = "A"
      this.detalleRegistro.alarma = "S"
      this.detalleRegistro.id = 0;
      this.detalleRegistro.fcambio = "";
      this.detalleRegistro.ucambio = "";
      this.detalleRegistro.fcreacion = "";
      this.detalleRegistro.ucreacion = "";
      //
      this.registroActual = 0;
      this.cancelarEdicion = true;
      this.mostrarImagenRegistro = "S";
      this.editando = false;
      this.botonera[1] = true;
      this.botonera[2] = true;
      this.botonera[3] = true;
      this.botonera[4] = true;
      this.botonera[5] = true;
      setTimeout(() => {
        if (this.maestroActual==0 && this.nivelActual==1)
        {
          this.lstParte3.focus();
        }
        else if (this.maestroActual==0)
        {
          this.txtCarga.nativeElement.focus();
        }
        else
        {
          this.lstParte.focus();
        }
        
      }, 300);
    }
    } 
  }

  listarPartes()
  {
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_partes ORDER BY nombre;"
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.partes = resp;
      
    });
  }

  listarCargas()
  {
    let sentencia = "SELECT a.id, CONCAT('#', a.carga, ' / Equipo: ', b.nombre, ' / Fecha: ', a.fecha) AS carga FROM " + this.servicio.rBD() + ".cargas a INNER JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id ORDER BY a.fecha;"
    this.cargas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.cargas = resp;
      
    });
  }

  listarProcesos()
  {
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_maquinas WHERE programar = 'S' ORDER BY nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
    });
  }

  listarCabProcesos()
  {
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_procesos ORDER BY nombre;"
    this.cabProcesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.cabProcesos = resp;
    });
  }


  nuevoRegistroGral()
  {
    this.nuevo();    
    
  }

  validarTabla()
  {
    let sentencia = "SELECT id FROM " + this.servicio.rBD() + ".cargas LIMIT 1";
    if (this.maestroActual == 0 && this.nivelActual == 1) 
    {
      sentencia = "SELECT id FROM " + this.servicio.rBD() + ".programacion LIMIT 1";
    }
    else if (this.maestroActual == 1) 
    {
      sentencia = "SELECT id FROM " + this.servicio.rBD() + ".prioridades LIMIT 1";
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        if (resp.length > 0)
        {
          if (resp[0].id > 0 && this.botonera[7])
          {
            this.botonera[7] = false;
            this.botonera[8] = false;
            this.botonera[9] = false;
            this.botonera[10] = false;
          }
          else if (!this.botonera[7])
          {
            this.botonera[7] = true;
            this.botonera[8] = true;
            this.botonera[9] = true;
            this.botonera[10] = true;
          }
        }
        else if (!this.botonera[7])
        {
          this.botonera[7] = true;
          this.botonera[8] = true;
          this.botonera[9] = true;
          this.botonera[10] = true;
        }
    }) 
  }

  deshacerEdicion(parametro: number, desde: number)
  {
    const respuesta = this.dialogo.open(DialogowipComponent, {
      width: "540px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[1427], mensaje: this.servicio.rTraduccion()[1879], alto: "60", id: 0, accion: 0, botones: 3, boton1STR: this.servicio.rTraduccion()[27], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[1880], icono2: "i_edicion", boton3STR: "Regresar", icono3: "i_cancelar", icono0: "in_pregunta" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        this.cancelarEdicion = true;
        this.validarGuardar();      
      }
      else if (result.accion == 2) 
      {
        this.cancelarEdicion = true;
        this.edicionCancelada();      
        if (desde == 1)
        {
          this.procesarPantalla(parametro)
        }
        else if (desde == 2)
        {
          this.buscarRegistro(parametro)
        }        
      }
    });
  }

  validarGuardar()
  {
    if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.carga)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2495]
      }
      if (!this.detalleRegistro.equipo)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2494]
      }
      if (!this.detalleRegistro.hora)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2501]
      }
      if (!this.detalleRegistro.fecha)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2504]
      }
      
      
      
      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {

          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            const respuesta = this.dialogo.open(DialogowipComponent, {
              width: "430px", panelClass: 'dialogo', data: { titulo: "Fecha de promesa vencida", mensaje: "La fecha de promesa de la carga ya esta vencida. ¿Desea continuar y guardar la carga?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[3404], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (!result)
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-normal";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[1388];
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
              else if (result.accion == 1) 
              {
                this.continuar();
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-normal";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[1388];
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })
          }
          else
          {
            this.continuar()
          }
        }
      }
        else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.carga)
          {
            this.txtCarga.nativeElement.focus();
          }
          else if (!this.detalleRegistro.equipo || this.detalleRegistro.equipo==0)
          {
            this.lstParte2.focus()
          }
          else if (!this.detalleRegistro.fecha)
          {
            this.txtFecha.nativeElement.focus()
          }
          else if (!this.detalleRegistro.hora)
          {
            this.txtDesde.nativeElement.focus()
          }
          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            this.txtFecha.nativeElement.focus()
          }
        }, 100);
      }
    }
    if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.carga || this.detalleRegistro.carga==0)
      {
        errores = errores + 1;
        this.faltaMensaje = this.servicio.rTraduccion()[1793];
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2496]
      }
      if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
      {
        errores = errores + 1;
        this.faltaMensaje = this.servicio.rTraduccion()[1793];
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2497]
      }
      
      if (!this.detalleRegistro.cantidad || this.detalleRegistro.cantidad == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2500]
      }
      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {
          let sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".cat_maquinas a INNER JOIN " + this.servicio.rBD() + ".det_rutas b ON a.proceso = b.proceso INNER JOIN " + this.servicio.rBD() + ".cat_partes c ON b.ruta = c.ruta INNER JOIN " + this.servicio.rBD() + ".cargas d ON a.id = d.equipo WHERE c.id = " + this.detalleRegistro.parte + " AND d.id = " + this.detalleRegistro.carga + ";"; 
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp[0].cuenta > 0)
            {
              this.detalleRegistro.id = (!this.detalleRegistro.id ? 0: +this.detalleRegistro.id)
              let sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".programacion WHERE parte = " + this.detalleRegistro.parte + " AND carga = " + this.detalleRegistro.carga + " AND id <> " + this.detalleRegistro.id + ";"; 
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                if (resp[0].cuenta == 0)
                {
                  this.guardar();
                }
                else
                {
                  const respuesta = this.dialogo.open(DialogowipComponent, {
                    width: "400px", panelClass: 'dialogo', data: { titulo: "Operación incongruente", mensaje: "El Número de parte que está programando ya forma parte de esta carga. Vaya a la pantalla anterior y seleccionelo para su edición", alto: "80", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
                  });
                }
              })
            }
            else
            {
              const respuesta = this.dialogo.open(DialogowipComponent, {
                width: "400px", panelClass: 'dialogo', data: { titulo: "Operación incongruente", mensaje: "El Número de parte que está programando no tiene en su ruta de fabricación al equipo asociado a esta Carga", alto: "80", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
              });
            }
          })
        }
      }
      else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.carga || this.detalleRegistro.carga==0)
          {
            this.lstParte3.focus()
          }
          if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
          {
            this.lstParte.focus()
          }
          else if (!this.detalleRegistro.cantidad || this.detalleRegistro.cantidad == 0)
          {
            this.txtCantidad.nativeElement.focus()
          }
        }, 100);
      }
    }
    else if (this.maestroActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
      {
        errores = errores + 1;
        this.faltaMensaje = this.servicio.rTraduccion()[1793];
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2497]
      }
      if (!this.detalleRegistro.proceso || this.detalleRegistro.proceso==0)
      {
        errores = errores + 1;
        this.faltaMensaje = this.servicio.rTraduccion()[1793];
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2499]
      }
      if (!this.detalleRegistro.hora)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2502]
      }
      if (!this.detalleRegistro.fecha)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2503]
      }
      if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = this.servicio.rTraduccion()[1793];
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[2505]
      }

      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {
          this.guardar();
        }
      }
      else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
          {
            this.lstParte.focus()
          }
          else if (!this.detalleRegistro.proceso || this.detalleRegistro.proceso==0)
          {
            this.lstParte4.focus()
          }
          else if (!this.detalleRegistro.fecha)
          {
            this.txtFecha.nativeElement.focus()
          }
          else if (!this.detalleRegistro.hora)
          {
            this.txtDesde.nativeElement.focus()
          }
          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            this.txtFecha.nativeElement.focus()
          }
          
        }, 100);
      }
    }
  }

  continuar()
  {
    let sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".cargas WHERE carga = '" + this.detalleRegistro.carga + "' AND id <> " + this.detalleRegistro.id + ";"; 
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].cuenta == 0)
      {
        this.guardar();
      }
      else
      {
        
        const respuesta = this.dialogo.open(DialogowipComponent, {
          width: "430px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[3402], mensaje: this.servicio.rTraduccion()[3403], alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[3404], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
        });
        respuesta.afterClosed().subscribe(result => {
          if (!result)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1388];
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (result.accion == 1) 
          {
            this.guardar();
          }
          else
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1388];
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
        })
      }
    })
  }

  guardar()
  {
    if (this.maestroActual == 0 && this.nivelActual==1) 
    {
      let sentencia = "SELECT c.capacidad, (SELECT SUM(cantidad) FROM " + this.servicio.rBD() + ".programacion WHERE carga = a.id AND id <> " + this.detalleRegistro.id + " AND estatus = 'A') AS cantidad FROM " + this.servicio.rBD() + ".cargas a INNER JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.equipo = c.id WHERE a.id = " + this.detalleRegistro.carga + " GROUP BY c.capacidad;"; 
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (+resp[0].capacidad < +this.detalleRegistro.cantidad + +resp[0].cantidad)
        {
          const respuesta = this.dialogo.open(DialogowipComponent, {
            width: "400px", panelClass: 'dialogo', data: { titulo: "Equipo sobrecargado", mensaje: this.servicio.rTraduccion()[2553].replace("campo_0", (+this.detalleRegistro.cantidad + +resp[0].cantidad)).replace("campo_1", resp[0].capacidad), alto: "60", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
          });
        }
        else
        {
          this.guardarFinal();
        }
      })
    }
    else
    {
      this.guardarFinal();
    }
    
  }

  guardarFinal()
  {
    this.editando = false;
    this.botonera[1] = true;
    this.botonera[2] = true;
    this.botonera[3] = false;
    this.botonera[4] = this.detalleRegistro.estatus == "I";
    this.botonera[5] = false;
    this.faltaMensaje = "";
    let campos = {};
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      if (!this.detalleRegistro.cantidad)
      {
        this.detalleRegistro.cantidad = 0;
      }
      campos = 
      {
        accion: 3000, 
        id: this.detalleRegistro.id,  
        cantidad: this.detalleRegistro.cantidad, 
        parte: this.detalleRegistro.parte,
        carga: this.detalleRegistro.carga, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id,
      };
    }
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      campos = 
      {
        accion: 3050, 
        id: this.detalleRegistro.id,  
        fecha: this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora, 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        carga: this.detalleRegistro.carga, 
        estatus: this.detalleRegistro.estatus,  
        equipo: this.detalleRegistro.equipo, 
        permitir_reprogramacion: this.detalleRegistro.permitir_reprogramacion,  
        alarma: this.detalleRegistro.alarma,  
        usuario: this.servicio.rUsuario().id,
        copiandoDesde: this.copiandoDesde 
      };
    }
    else if (this.maestroActual == 1)
    {
      if (this.detalleRegistro.orden==0)
      {
        this.detalleRegistro.orden = 1;
      }
      campos = 
      {
        accion: 3100, 
        id: this.detalleRegistro.id,  
        fecha: this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora, 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        orden: (!this.detalleRegistro.orden ? 1 : this.detalleRegistro.orden), 
        parte: this.detalleRegistro.parte, 
        proceso: this.detalleRegistro.proceso, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id,
      };
    }
    this.servicio.consultasBD(campos).subscribe((datos: string) =>{
    if (datos)
    {
      if (datos.substring(0, 1) == "A")
      {
        this.detalleRegistro.id = +datos.substring(1, 10);
        this.registroActual = this.detalleRegistro.id
        this.detalleRegistro.ucreacion = (this.servicio.rUsuario().nombre ? this.servicio.rUsuario().nombre : this.servicio.rTraduccion()[8]);
        this.detalleRegistro.fcreacion = new Date(); 
      }
      this.estatusActual = this.detalleRegistro.estatus;
      this.detalleRegistro.fcambio = new Date();
      this.detalleRegistro.ucambio = (this.servicio.rUsuario().nombre ? this.servicio.rUsuario().nombre : this.servicio.rTraduccion()[8]);
      this.botonera[4] = this.detalleRegistro.estatus == "I";
      this.cancelarEdicion = false;
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[2005];
      mensajeCompleto.tiempo = 2500;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET planes = 'S'";
      {
        //sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET cat_maquinas = 'S'"
      }
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        setTimeout(() => {
          this.revisar()  
        }, +this.tiempoRevision);
        if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          let campos = {accion: 1400, id: this.detalleRegistro.ruta};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
          });
        }
      })
    }})
  }
  

  edicionCancelada()
  {
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "snack-normal";
    mensajeCompleto.mensaje = this.servicio.rTraduccion()[1388];
    mensajeCompleto.tiempo = 3000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
  }

  inicializarPantalla()
  {
    this.detalleRegistro = [];
    this.detalleRegistro.fecha = new Date();
    this.detalleRegistro.desde= "00:00:00"
    this.detalleRegistro.hasta= "23:59:59"
    this.registroActual = 0;
    this.cancelarEdicion = false;
    this.mostrarImagenRegistro = "S";
    this.editando = false;
    this.detalleRegistro.estatus = "A"
    this.botonera[1] = true;
    this.botonera[2] = true;
    this.botonera[3] = true;
    this.botonera[4] = true;
    this.botonera[5] = true;
    setTimeout(() => {
      if (this.maestroActual==0 && this.nivelActual==1)
      {
        this.lstParte3.focus();
      }
      else if (this.maestroActual==0)
      {
        this.txtCarga.nativeElement.focus();
      }
      else
      {
        this.lstParte.focus();
      }
      
    }, 300);
    
  }

  validarInactivar(id: number, accion: number)
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[2542], mensaje: this.servicio.rTraduccion()[2620], alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
      });
      return;
    }
    else
    {

    
      
    let idBuscar = (id == 0 ? this.registroActual : id);
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      //sentencia = "SELECT COUNT(*) AS totalr FROM " + this.servicio.rBD() + ".det_rutas WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    if (sentencia)
    {
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp && resp[0].totalr > 0)
        {
          if (accion == 2)
          {
            this.faltaMensaje = this.servicio.rTraduccion()[134]
          }
          let mensaje = this.servicio.rTraduccion()[2621].replace("campo_0", resp[0].totalr)
          if (this.maestroActual == 1)
          {
            mensaje = this.servicio.rTraduccion()[2622].replace("campo_0", resp[0].totalr)
          }
            const respuesta = this.dialogo.open(DialogowipComponent, {
            width: "400px", panelClass: 'dialogo', data: { titulo: "Inactivar " + this.literalSingular, mensaje: mensaje, alto: "80", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
          });
        }
        else if (accion == 1)
        {
          this.Inactivar(idBuscar);
        }
        else if (accion == 2)
        {
          this.guardar();
        }
      })
    }
    else
    {
      this.Inactivar(idBuscar);
    }
  }
  }

  Inactivar(idBuscar: number)
  {
    let mensaje = this.servicio.rTraduccion()[2623];
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2624];
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2625];
    }
    const respuesta = this.dialogo.open(DialogowipComponent, {
      width: "430px", panelClass: 'dialogo', data: { titulo: "Inactivar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[2626], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE " + this.servicio.rBD() + ".cargas SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";UPDATE " + this.servicio.rBD() + ".lotes SET carga = 0 WHERE carga = " + idBuscar;
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".programacion SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";UPDATE " + this.servicio.rBD() + ".lotes SET carga = 0 WHERE carga = " + this.idNivel0 + " AND parte = " + idBuscar; 
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".prioridades SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.literalSingularArticulo + this.servicio.rTraduccion()[2627];
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET planes = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET cat_maquinas = 'S'"
          }
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
            })
          if (this.verRegistro == 1)
          {
            let indice = this.registros.findIndex(c => c.id == idBuscar)
            {
              let sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".programacion a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".prioridades a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                this.registros[indice].estatus = this.servicio.rTraduccion()[1155];
                this.registros[indice].fcambio = resp[0].fcambio;
                this.registros[indice].ucambio = resp[0].ucambio;
                indice = this.arrFiltrado.findIndex(c => c.id == idBuscar)
                this.arrFiltrado[indice].estatus = this.servicio.rTraduccion()[1155];
                this.arrFiltrado[indice].fcambio = resp[0].fcambio;
                this.arrFiltrado[indice].ucambio = resp[0].ucambio;
              })
            } 
          }
        })
      }
    });
  }

  eliminar(idBuscar: number)
  {
    let mensaje = this.servicio.rTraduccion()[2628];
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2629];
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2630];
    }
    const respuesta = this.dialogo.open(DialogowipComponent, {
      width: "430px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[388] + " " +this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[1981], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_eliminar" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "DELETE FROM " + this.servicio.rBD() + ".cargas  WHERE id = " + idBuscar + ";DELETE FROM " + this.servicio.rBD() + ".programacion WHERE carga = " + idBuscar + ";UPDATE " + this.servicio.rBD() + ".lotes SET carga = 0 WHERE carga = " + idBuscar;
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "DELETE FROM " + this.servicio.rBD() + ".programacion  WHERE id = " + idBuscar +";UPDATE " + this.servicio.rBD() + ".lotes SET carga = 0 WHERE carga = " + this.idNivel0 + " AND parte = " + idBuscar;
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "DELETE FROM " + this.servicio.rBD() + ".prioridades  WHERE id = " + idBuscar;
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          this.buscarRegistro(3)
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.literalSingularArticulo + this.servicio.rTraduccion()[2631];
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET planes = 'S';";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET cat_maquinas = 'S';"
          }
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
              if (this.maestroActual == 1 && this.nivelActual == 1)
              {
                let campos = {accion: 1600, id: this.detalleRegistro.ruta};  
                this.servicio.consultasBD(campos).subscribe( resp =>
                {
                });
              }
            })
        })
      }
    });
  }

  reactivar(idBuscar: number)
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[2542], mensaje: this.servicio.rTraduccion()[2620], alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: "", icono2: "", icono0: "i_inactivar" }
      });
      return;
    }
    else
    {

    
    let mensaje = this.servicio.rTraduccion()[2632];
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2633];
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = this.servicio.rTraduccion()[2634];
    }
    const respuesta = this.dialogo.open(DialogowipComponent, {
      width: "430px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[1971] + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[1971], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE " + this.servicio.rBD() + ".cargas SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".programacion SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".prioridades SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          let indice = this.registros.findIndex(c => c.id == idBuscar);
          {
            let sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".cargas a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".programacion a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(DATE_FORMAT(a.modificacion, '%Y/%m/%d %H:%i'), '" + this.servicio.rTraduccion()[8] + "') AS fcambio, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ucambio FROM " + this.servicio.rBD() + ".prioridades a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              this.registros[indice].estatus = this.servicio.rTraduccion()[1154];
              this.registros[indice].fcambio = resp[0].fcambio;
              this.registros[indice].ucambio = resp[0].ucambio;
              indice = this.arrFiltrado.findIndex(c => c.id == idBuscar)
              this.arrFiltrado[indice].estatus = this.servicio.rTraduccion()[1154];
              this.arrFiltrado[indice].fcambio = resp[0].fcambio;
              this.arrFiltrado[indice].ucambio = resp[0].ucambio;
            })
          }
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.literalSingularArticulo + this.servicio.rTraduccion()[1970];
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET planes = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE " + this.servicio.rBD() + ".actualizaciones SET cat_maquinas = 'S'"
          }
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
            })
        })
      }
    });
  }
  }

    refrescar()
    {
      this.verRegistro = 21;
      this.llenarRegistros();
    }

    liberar(id: number)
    {
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "480px", panelClass: 'dialogo', data: { revision: -1, clave: "1", claves:"", causaC: -1, causaD: this.registros[id].causa + this.servicio.rTraduccion()[2637] + this.registros[id].causaref + ")", titulo: this.servicio.rTraduccion()[2635], mensaje: "", alto: "60", id: 0, accion: 298, botones: 2, boton1STR: this.servicio.rTraduccion()[2636], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          let sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', carga = 0, finaliza = NULL, hasta = NULL, calcular_hasta = '1', equipo = 0, fecha = NOW() WHERE id = " + this.registros[id].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET equipo = 0, fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, alarma_so = 'N', alarma_so_rep = NULL WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";UPDATE " + this.servicio.rBD() + ".calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = "El lote se ha retornado al proceso: '" + this.registros[id].nproceso + "' y tendrá alta prioridad";
            mensajeCompleto.tiempo = 3000;
            
            this.servicio.mensajeToast.emit(mensajeCompleto);
            let sentencia = "SELECT numero, parte, proceso FROM " + this.servicio.rBD() + ".lotes WHERE id = " + this.registros[id].id
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( datoLote =>
            {
                this.registros.splice(id, 1);
                let nuevaFecha = this.datepipe.transform(new Date().setDate(new Date().getDate() +1), "yyyy/MM/dd HH:mm:ss");
                let campos2 = 
                {
                  accion: 3100, 
                  id: 0,  
                  fecha: nuevaFecha, 
                  notas: this.servicio.rTraduccion()[2638] + datoLote[0].numero, 
                  orden: 1,
                  parte: datoLote[0].parte, 
                  proceso: datoLote[0].proceso, 
                  estatus: "A",  
                  usuario: this.servicio.rUsuario().id,
                };
                this.servicio.consultasBD(campos2).subscribe((datos: string) =>{
                })
              })
            })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2639];
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      })

    }

    rechazar(id: number)
    {
      if (this.maestroActual==3)
      {
        this.aInspeccion(id);
        return;
      }
      //this.servicio.aEscanear(false);
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "480px", panelClass: 'dialogo', data: { revision: 50, causaD: "", causaC: 0, claves: "", usuarioCalidad: 0, clave: "3", titulo: this.servicio.rTraduccion()[2640], mensaje: "", alto: "60", id: 0, accion: 297, botones: 2, boton1STR: this.servicio.rTraduccion()[2641], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {

          let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".calidad_historia WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( datoLote =>
          {
            let sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 90, carga = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', rechazos = rechazos + 1, rechazo_id = " + result.causaC + ", rechazado_por = " + result.usuarioCalidad + ", rechazo = NOW() WHERE id = " + this.registros[id].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET rechazos = rechazos + 1 WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";";
            if (datoLote.length > 0)
            {
              sentencia = sentencia + "UPDATE " + this.servicio.rBD() + ".calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + datoLote[0].id + ";INSERT INTO " + this.servicio.rBD() + ".calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + datoLote[0].lote + ", " + datoLote[0].secuencia + ", 50, " + datoLote[0].parte + ", " + result.causaC + ", " + result.usuarioCalidad + ", " + datoLote[0].proceso + ", " + datoLote[0].equipo + ", NOW());";
            }
            
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2553].replace("campo_0", this.registros[id].elote).replace("campo_1", result.causaD);
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.registros.splice(id, 1);
            })
          })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2639];
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        //this.servicio.aEscanear(true);
    })
  }



    aInspeccion(id: number)
    {
      //this.servicio.aEscanear(false);
      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "480px", panelClass: 'dialogo', data: { revision: 0, causaD: "", causaC: 0, claves: "", usuarioCalidad: 0, clave: "3", titulo: this.servicio.rTraduccion()[2643], mensaje: "", alto: "60", id: 0, accion: 296, botones: 2, boton1STR: this.servicio.rTraduccion()[2644], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".calidad_historia WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( datoLote =>
          {
            sentencia = "UPDATE " + this.servicio.rBD() + ".lotes SET estado = 80, carga = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', inspecciones = inspecciones + 1, inspeccion_id = " + result.causaC + ", inspeccionado_por = " + result.usuarioCalidad + ", inspeccion = NOW() WHERE id = " + this.registros[id].id + ";UPDATE " + this.servicio.rBD() + ".lotes_historia SET inspecciones = inspecciones + 1 WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";";
            if (datoLote.length > 0)
            {
              sentencia = sentencia + "UPDATE " + this.servicio.rBD() + ".calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + datoLote[0].id + ";INSERT INTO " + this.servicio.rBD() + ".calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + datoLote[0].lote + ", " + datoLote[0].secuencia + ", 0, " + datoLote[0].parte + ", " + result.causaC + ", " + result.usuarioCalidad + ", " + datoLote[0].proceso + ", " + datoLote[0].equipo + ", NOW())"
            }
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2553].replace("campo_0", this.registros[id].elote).replace("campo_1", result.causaD)
              
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.registros.splice(id, 1);
            })
          })
          
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2639];
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        //this.servicio.aEscanear(true);
    })

    }

    explorar(id: number, nombre: string)
    {    
      this.idNivel0 = id;
      this.nivelActual = 1;
      this.nombreRuta = nombre;
      this.procesarPantalla(2);
    }

    filtro()
    {
      this.soloStock = !this.soloStock;
      this.llenarRegistros();
    }

    filtroCarga()
    {
      this.soloActivas = !this.soloActivas;
      this.llenarRegistros();
    }

    refrescarLote()
    {
      this.verRegistro = 22;
      this.recuperar();
    }

    regresar()
    {
      //Vista general por grupo
      if (this.verRegistro != 2)
      {
      this.procesarPantalla(this.vision + 1);  
      this.validarTabla();
      }
      else
      {
        this.verRegistro = 21;
        this.llenarRegistros();
      
      }
    }

    genSecuencia()
    {

      const respuesta = this.dialogo.open(DialogowipComponent, {
        width: "430px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[2645], mensaje: this.servicio.rTraduccion()[2646], alto: "60", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[2647], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", boton3STR: "", icono3: "", icono0: "in_pregunta" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          let loteID = this.registroActual
          let sentencia = "SELECT a.parte, a.proceso, a.numero, a.ruta, b.secuencia, b.id AS iddet_ruta FROM " + this.servicio.rBD() + ".lotes a INNER JOIN " + this.servicio.rBD() + ".det_rutas b ON a.ruta = b.ruta AND b.proceso = a.proceso INNER JOIN " + this.servicio.rBD() + ".cat_procesos c ON c.id = a.proceso WHERE a.id = " + loteID + " ORDER BY b.secuencia LIMIT 1;";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            sentencia = "INSERT INTO " + this.servicio.rBD() + ".ruta_congelada (lote, id_detruta, ruta, secuencia, proceso) SELECT " + loteID + ", id, ruta, secuencia, proceso FROM " + this.servicio.rBD() + ".det_rutas WHERE estatus = 'A' AND ruta = " + resp[0].ruta + ";INSERT INTO " + this.servicio.rBD() + ".lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada) VALUES (" + loteID + ", " + resp[0].id + ", " + resp[0].ruta + ", " + resp[0].iddet_ruta + ", " + resp[0].secuencia + ", " + resp[0].proceso + ", NOW());";
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( dato =>
            {
              
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2648].replace("campo_0", resp[0].numero);
              mensajeCompleto.tiempo = 5000;
              this.servicio.mensajeToast.emit(mensajeCompleto);


              //
              sentencia = "SELECT a.fecha_estimada, a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_salida, e.secuencia, IFNULL(a.id, 0) AS pasado, 1 AS salto, SEC_TO_TIME(a.tiempo_total) AS tiempoSEC, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nruta_detalle, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo FROM " + this.servicio.rBD() + ".ruta_congelada e LEFT JOIN " + this.servicio.rBD() + ".lotes_historia a ON e.lote = a.lote AND e.secuencia = a.ruta_secuencia LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON e.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.equipo = c.id WHERE e.lote = " + this.registroActual + " ORDER BY e.secuencia;"
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                this.cubiertas = 0;
                this.actual = 0;
                this.saltos = 0;
                let totales = 0;
                let blancos = 0;
                for (var i = 0 ; i < resp.length; i++)
                {
                  totales = totales + 1;
                  if (+resp[i].pasado > 0)
                  {
                    this.actual = i;
                    this.saltos = blancos;
                    this.cubiertas = totales;
                    resp[i].salto = 0;
                  }
                  else
                  {
                    blancos = blancos + 1;
                  }
                }  
                if (!resp[this.actual].fecha_salida)
                {
                  this.cubiertas = this.cubiertas - 1;
                }
                
                this.cadHistorico = this.servicio.rTraduccion()[2541].replace("campo_0", Math.floor(this.cubiertas / resp.length * 100)).replace("campo_1", this.cubiertas + this.servicio.rTraduccion()[436] + resp.length).replace("campo_2", this.saltos);
                this.historicos = resp;
              });
              //
              
            })
          })
        }
      })
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
      this.lotesF = [];
      this.detalleRegistro.loteID = -1;
      this.servicio.activarSpinnerSmall.emit(true);
      if (miCad) 
      {
        for (var i = 0; i < this.lotes.length; i  ++)
        {
          if (this.lotes[i].nombre)
          {
            if (this.lotes[i].nombre.toLowerCase().indexOf(miCad.toLowerCase()) !== -1)
            {
              this.lotesF.splice(this.lotesF.length, 0, this.lotes[i]);
            }
          }
        }
      }
      else
      {
        this.lotesF = this.lotes;
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
          this.detalleRegistro.lote = this.servicio.rTraduccion()[1495];
          this.detalleRegistro.loteID = 0;
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
        if (idBuscar == 0)
        {
          this.detalleRegistro.lote = this.servicio.rTraduccion()[1495];
          this.detalleRegistro.loteID = 0;
          return;
        }
      }
      //Buscar parte
      this.servicio.activarSpinnerSmall.emit(true);
      let sentencia = "SELECT a.id, c.id AS parte, CASE WHEN ISNULL(c.nombre) THEN a.numero ELSE CONCAT(a.numero, ' / ', c.nombre) END AS nombre FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id WHERE a.id = " + idBuscar;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.detalleRegistro.lote = resp[0].nombre; 
          this.detalleRegistro.loteID = resp[0].id;
          this.lotesF = resp;
          if (this.detalleRegistro.parteID<=0)
          {
            if (resp[0].parte)
            {
              this.detalleRegistro.parte = resp[0].parte;
              this.buscarDatos(1, this.detalleRegistro.parte);
            }
            else
            {
              this.detalleRegistro.parte = this.servicio.rTraduccion()[1495];
              this.detalleRegistro.parteID = 0;
            }
            
          }
        }
        setTimeout(() => {
          this.servicio.activarSpinnerSmall.emit(false);
        }, 100);
      })
    }
  }

  llenarLotes()
  {
    let sentencia = "SELECT a.id, CONCAT(a.numero, ' / ', c.nombre) AS nombre FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id ORDER BY a.numero ";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.lotes = resp;
      })
  }

  

}
