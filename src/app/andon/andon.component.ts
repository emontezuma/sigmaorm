import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ViewportRuler } from "@angular/cdk/overlay";
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { Router } from '@angular/router';
import { SesionComponent } from '../sesion/sesion.component';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DatePipe } from '@angular/common'
import { jsPDF } from "jspdf";
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-andon',
  templateUrl: './andon.component.html',
  styleUrls: ['./andon.component.css'],
  animations: [
    trigger('esquema', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(5px)' }),
        animate('0.15s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.15s', style({ opacity: 0, transform: 'translateY(5px)' }))
      ])
    ]),
    trigger('esquema_del', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(15px)' }),
        animate('0.5s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0, transform: 'translateY(15px)' }))
      ])
    ]),
    trigger('esquema_izq', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(15px)' }),
        animate('0.5s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0, transform: 'translateX(-15px)' }))
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

export class AndonComponent implements OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("txtNotas", { static: false }) txtNotas: ElementRef;
  @ViewChild("txtT1", { static: false }) txtT1: ElementRef;
  @ViewChild("txtT10", { static: false }) txtT10: ElementRef;
  @ViewChild("txtT9", { static: false }) txtT9: ElementRef;
  @ViewChild("lstC10", { static: false }) lstC10: MatSelect;
  @ViewChild("lstC11", { static: false }) lstC11: MatSelect;
  @ViewChild(MatAutocompleteTrigger, {read: MatAutocompleteTrigger}) listaFallas: MatAutocompleteTrigger;


  
  scrollingSubscription: Subscription;
  vistaCatalogo: Subscription;
  //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";  
  URL_FOLDER = "/sigma/assets/datos/";  


  constructor
  (
    public servicio: ServicioService,
    private route: ActivatedRoute,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private router: Router, 
    private viewportRuler: ViewportRuler,
    public datepipe: DatePipe,
  ) {

    this.emit00 = this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 92;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 2;// - (pantalla ? 0 : this.servicio.rAnchoSN());// : 0);
    });
   
    this.emit10 = this.servicio.teclaBuscar.subscribe((accion: boolean)=>
    {
      this.buscar();
    });
    this.emit20 = this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.escapar();
    });
    this.emit30 = this.servicio.esMovil.subscribe((accion: boolean)=>
    {
      this.movil = accion;
    });
    this.emit40 = this.servicio.cambioTurno.subscribe((accion: boolean)=>
    {
      this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
    });

    this.emit50 = this.servicio.vista.subscribe((accion: number)=>
    {
      this.iniciado = false;
      if (accion == 10 || accion == 11)
      {
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        
        this.servicio.mostrarBmenu.emit(0);
        this.vistaOperador = accion == 10 ; 
        this.enTecnico = !this.vistaOperador;
        this.miSeleccion = this.vistaOperador ? 1 : 11;  
        this.rConfiguracion();
        if ((this.servicio.rUsuario().preferencias_andon.substr(60, 1) == "1" && this.vistaOperador) || (this.servicio.rUsuario().preferencias_andon.substr(64, 1) == "1" && !this.vistaOperador))
        {
          //this.modelo = this.modelo == 2 ? 2 : 12;
          this.modelo = 2;
          this.ayuda11 = this.servicio.rTraduccion()[0]
          this.iconoVista = "i_vdetalle"
          this.verTabla = false;
        }
        else
        {
          //this.modelo = this.modelo == 3 ? 3 : 13; 
          this.modelo = 3;
          this.ayuda11 = this.servicio.rTraduccion()[1]
          this.iconoVista = "i_vcuadro"
          this.verTabla = true;
        }
        if (this.vistaOperador)
        {
          this.boton02 = false;
          this.boton03 = false;
          this.boton04 = false;
    
          this.prevalidar(1);
        }
        else
        {
          this.miSeleccion = +this.servicio.rUsuario().ultimo_reporte + 11;
          if (this.miSeleccion > 14)
          {
            this.miSeleccion = 14;
          }
          this.rRegistros(this.miSeleccion);
        }
        if (this.enTecnico)
        {
          this.iniLeerBD()
        }
        else
        {
          this.servicio.aUsuarioAnterior(this.servicio.rUsuario())
        }
      }
    });
    this.emit60 = this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 6) == "/andon" && (this.enTecnico || this.miSeleccion==15))
      {
        this.cadaSegundo();
      }
    });
    this.emit70 = this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.laSeleccion[0] = 0;
    this.laSeleccion[1] = 0;
    this.laSeleccion[2] = 0;
    this.laSeleccion[3] = 0;
    this.laSeleccion[4] = "['" + this.servicio.rTraduccion()[2] + "']";
    this.laSeleccion[5] = "['" + this.servicio.rTraduccion()[3] + "']";
    this.laSeleccion[6] = "['" + this.servicio.rTraduccion()[4] + "']";
    this.laSeleccion[7] = "['" + this.servicio.rTraduccion()[5] + "']";
    this.laSeleccion[8] = "";
    this.laSeleccion[9] = "";
    this.laSeleccion[10] = "";
    this.laSeleccion[11] = "";
    
    if (this.servicio.rVista() == 10)
    {
      this.vistaOperador = true;
      if (this.servicio.rUsuario().preferencias_andon.substr(0, 1) == "1")
      {
        this.modelo = 2;
        this.ayuda11 = this.servicio.rTraduccion()[0]
        this.iconoVista = "i_vdetalle"
        this.verTabla = false;
      }
      else
      {
        this.modelo = 3;  
        this.ayuda11 = this.servicio.rTraduccion()[1]
        this.iconoVista = "i_vcuadro"
        this.verTabla = true;
      }
      
      this.prevalidar(1)
      //this.miSeleccion = 1;
      //this.rRegistros(this.miSeleccion);
      this.servicio.aUsuarioAnterior(this.servicio.rUsuario())
    }
    else
    {
      this.enTecnico = true; 
      this.vistaOperador = false;
      if (this.servicio.rUsuario().preferencias_andon.substr(5, 1) == "1")
      {
        this.modelo = 2;
        this.ayuda11 = this.servicio.rTraduccion()[0]
        this.iconoVista = "i_vdetalle"
        this.verTabla = false;
      }
      else
      {
        this.modelo = 3;  
        this.ayuda11 = this.servicio.rTraduccion()[1]
        this.iconoVista = "i_vcuadro"
        this.verTabla = true;
      }
      this.miSeleccion = +this.servicio.rUsuario().ultimo_reporte + 11;
      this.rRegistros(this.miSeleccion);
      
      //this.rRegistros(this.miSeleccion);
      this.iniLeerBD();
      
    }
    this.rConfiguracion();
    
  }

  ngOnInit() {

    this.servicio.validarLicencia(1)
    this.servicio.mostrarBmenu.emit(0);    
    this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
    this.listarAreas();
  }

  ngOnDestroy() {

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
  qrvalue = "";

  local: string = "";
  clavePublica: string = "";
  claveInterna: string = "";
  tipo: string = "";
  offSet: number;
  confirmador: number = 0;
  parametroVista: number = 0;
  tEnviados: number = 0;
  noLicenciados: number = 0;
  secuencia: number = 0;
  areas: any = [];
  verIrArriba: boolean = false;
  verPanel: boolean = true;
  todasLasAreas: boolean = true;
  cincoW: boolean = false;
  cr: boolean = false;
  afecta_oee: string = "N";
  palabraClave: string = "CronosIntegracion2019";
  indicePreferencia: number = 0;
  clave: string = "";
  aceptarBoton: boolean = true;
  guardando: boolean = false;
  verBuscar: boolean = true;
  desdeBoton: boolean = false;
  cadSQLActual: string = "";
  numeroItem: number = 0;
  yaVer: boolean = false;
  verAyuda: boolean = true;
  verTabla: boolean = false;
  cambioVista: boolean = true;
  hayFiltro: boolean = false;
  repVencido: boolean = false
  movil: boolean = false;
  verBarra: string = "";
  ayudaANDON: string = "";
  ultimoID: number = 0;
  textoBuscar: string = "";
  textoBuscado: string = "";
  nuevoRegistro: string = ";"
  maestroActual: number = 0;
  modelo: number = 0;
  cancelarEdicion: boolean = false;
  envioCancelado: boolean = false;
  iniciarEliminacion: number = 0;
  iconoMMCALL: string = "./assets/icons/mmcall.png";
  altoPantalla: number = this.servicio.rPantalla().alto - 92;
  anchoPantalla: number = this.servicio.rPantalla().ancho - 10 + this.servicio.rAnchoSN();
  errorTitulo: string = "[" + this.servicio.rTraduccion()[6] + "]";
  errorMensaje: string = "";
  pantalla: number = 2;  
  miSeleccion: number = 1;
  iconoGeneral: string = "";
  iconoVista: string = "";
  tituloBuscar: string = "";
  alarmados: number = 0;
  elTiempo: number = 0;
  origenReporte: number = 0;
  enCadaSegundo: boolean = false;
  contarTiempo: boolean = false;
  visualizarImagen: boolean = false;
  sondeo: number = 0;
  registros: any = [];
  arrFiltrado: any = [];
  listas: any = [];
  cronometro: any;
  leeBD: any;
  laSeleccion: any = [];
  laSeleccionTMP: any = [];
  configuracion: any = [];
  total: any = {rsa: 0, rsaa: 0, ral: 0, rer: 0, rala: 0, rera: 0};
  fallas: any = [];
  fallasF: any = [];
  
  herramentales: any = [];
  partesF: any = [];
  cadenaAntes: string = "";
  
  arreTiempos: any = [];
  arreHover: any = [];
  detalle: any = [];
  causaraiz: any = [];
  notas: string = "";
  reporteSeleccionado: number = 0;
  maquinaSeleccionado: string = 'N';
  enTecnico: boolean = false;
  hoverp01: boolean = false;
  hoverp02: boolean = false;
  noLeer: boolean = false;
  operacioSel: boolean = false;
  vistaOperador: boolean = true;
  todos: boolean = false;
  maquinaSel: boolean = false;
  reparandoSel: boolean = false;
  abiertoSel: boolean = false;
  lineaSel: boolean = false;
  editando: boolean = false;
  iniciado: boolean = false;
  hoverp: any = [];

  rsaAlarmado: number = 0;
  rerAlarmado: number = 0;
  ralAlarmado: number = 0;

  faltaMensaje: string = "";
  responsableSel: boolean = false;
  fallaSel: boolean = false;
  envioSel: boolean = false;  
  rAlarmado: string = "N";
  horaReporte;
  mensajePadre: string = "";
  mostrarDetalle: boolean = false;

  boton01: boolean = true;
  boton02: boolean = false;
  boton03: boolean = false;
  boton04: boolean = false;
  boton11: boolean = true;
  boton12: boolean = true;
  boton13: boolean = true;
  boton14: boolean = true;

  animando: boolean = true;
  listoMostrar: boolean = true;

  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  error04: boolean = false;
  
  literalSingular: string = "";
  literalSingularArticulo: string = "";
  literalPlural: string = "";

  ayuda11: string = "[" + this.servicio.rTraduccion()[7] + "]";
  cliente: string = "";

  escapar()
  {
    if (this.verBuscar)
    {
      this.textoBuscar = "";
      this.textoBuscado = "";
    }
    else
    {
      this.cancelar();
    }
  }

  buscar()
  {
    if (this.verBuscar)
    {
      setTimeout(() => {
        this.txtBuscar.nativeElement.focus();
      }, 300);
    }
  }

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

  cancelar()
  {
    
  }

  salidaEfecto(evento: any)
  {
    if (evento.toState)
    {
      this.verPanel = true;
      this.modelo = this.modelo > 10 ? this.modelo - 10 : this.modelo;
      
    }
    
  }

  mostrar(modo: number)
  {
    if (modo == 1 && this.registros.length == 0)
    {
      this.listoMostrar = true;
    }
    else if (this.registros.length > 0)
    {
      this.listoMostrar = false;
    }
    
  }

  reporte()
  {
    this.modelo = this.modelo >= 10 ? 2 : 12;
    this.iconoGeneral = "i_lineas";
    this.rRegistros(1);
    this.miSeleccion = 1;
  }

  botones(accion: boolean)
  {
    if (this.boton11 == accion)
  this.boton11 = accion;
  }

  rRegistros(tabla: number)
  {
    if (this.iniciado)
    {
      this.verPanel = false;
    }
    this.botones(false);
    setTimeout(() => {
      this.botones(false);
      
    }, 1500);
    this.yaVer = true;
    //this.verBuscar = tabla <= 4 || tabla==11;
    //this.cambioVista = tabla <= 4 || tabla==1;
    //this.registros = [];
    //this.arrFiltrado = [];
    //this.arreHover = [];
    this.servicio.activarSpinner.emit(true);     
    this.visualizarImagen = false;  
    //
    this.animando = false;
    let sentencia: string  = "";
    this.editando = false;
    
    if (tabla == 1)
    {
      this.indicePreferencia = 61;
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_lineas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 1 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' ORDER BY a.nombre;"
      if (this.servicio.rUsuario().linea=="S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_lineas a WHERE a.estatus = 'A' ORDER BY a.nombre;"
      }      
      this.literalSingular = this.servicio.rTraduccion()[30];
      this.literalPlural = this.servicio.rTraduccion()[31];
      this.literalSingularArticulo = this.servicio.rTraduccion()[32];
      this.mensajePadre = "";
    }
    else if (tabla == 2)
    {
      this.todasLasAreas = true;
      this.indicePreferencia = 62;
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, 'S' AS mostrarImagen, area FROM " + this.servicio.rBD() + ".cat_maquinas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 2 AND b.usuario = " + this.servicio.rUsuario().id + " LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id WHERE a.estatus = 'A' AND (a.linea = " + +this.laSeleccion[0] + " OR a.linea = 0) ORDER BY a.nombre;"
      if (this.servicio.rUsuario().maquina=="S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, 'S' AS mostrarImagen, area FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id WHERE a.estatus = 'A' AND (a.linea = " + +this.laSeleccion[0] + " OR a.linea = 0) ORDER BY a.nombre;"
      }      
      this.mensajePadre = this.servicio.rTraduccion()[33] + " " + this.laSeleccion[4];
      this.literalSingular = this.servicio.rTraduccion()[34];
      this.literalPlural = this.servicio.rTraduccion()[35];
      this.literalSingularArticulo = this.servicio.rTraduccion()[36];
    }
    else if (tabla == 3)
    {
      this.indicePreferencia = 63;
      let cadAdic = "AND (a.id IN (SELECT b.proceso FROM " + this.servicio.rBD() + ".cat_fallas a INNER JOIN " + this.servicio.rBD() + ".relacion_fallas_operaciones b ON a.id = b.falla AND b.tipo = 3 WHERE (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2))) OR (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".cat_fallas a WHERE a.area = 'S' AND (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2))) > 0) "

      let cadAdicNueva = "";
      if (!this.todasLasAreas) 
      {
        cadAdicNueva = " AND " + +this.laSeleccion[1] + " IN (SELECT maquina FROM " + this.servicio.rBD() + ".relacion_areas_maquinas WHERE area = a.id) "
      }
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S'  AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_areas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 3 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.andon = 'S' " + cadAdicNueva + cadAdic + " ORDER BY a.nombre;"
      if (this.servicio.rUsuario().area=="S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S'  AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.estatus = 'A' AND a.andon = 'S' " + cadAdicNueva + cadAdic + " ORDER BY a.nombre;"
      }
      this.literalSingular = this.servicio.rTraduccion()[37];
      this.literalPlural = this.servicio.rTraduccion()[38];
      this.literalSingularArticulo = this.servicio.rTraduccion()[39];
      this.mensajePadre = "";
    }
    else if (tabla == 4)
    {
      this.indicePreferencia = 64;
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.afecta_oee, a.imagen, 'S' AS mostrarImagen, IFNULL(a.ultima_incidencia, '') AS ultima_incidencia FROM " + this.servicio.rBD() + ".cat_fallas a WHERE (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2)) AND (a.area = 'S' OR " + +this.laSeleccion[2] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 3));";
      this.literalSingular = this.servicio.rTraduccion()[40];
      this.literalPlural = this.servicio.rTraduccion()[41];
      this.literalSingularArticulo = this.servicio.rTraduccion()[42];
      this.mensajePadre = "";
    }
    else if (tabla == 11 || tabla == 12 || tabla == 13 || tabla == 14 || tabla == 15 )
    {
      this.indicePreferencia = 54 + tabla;
      this.registros = [];
      this.arrFiltrado = [];
      this.arreHover = [];
      this.sondeo = 0;
      this.contarTiempo = false;
      this.totales();
      let filtroLinea = ""
      if (this.servicio.rUsuario().linea!="S")
      {
        filtroLinea = " AND a.linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + this.servicio.rUsuario().id + ") ";
      } 
      let filtroMaquina = ""
      if (this.servicio.rUsuario().maquina!="S")
      {
        filtroMaquina = " AND a.maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + this.servicio.rUsuario().id + ") ";
      } 
      if (this.servicio.rUsuario().linea!="S" && this.servicio.rUsuario().maquina!="S")
      {
        filtroLinea = " AND (a.linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + this.servicio.rUsuario().id + ") OR a.maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + this.servicio.rUsuario().id + ")) ";
        filtroMaquina = "";
      } 
      let filtroArea = ""
      if (this.servicio.rUsuario().area!="S")
      {
        filtroArea = " AND a.area IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 3 AND usuario = " + this.servicio.rUsuario().id + ") ";
      } 

      if (tabla == 11)
      {
        this.tituloBuscar = this.servicio.rTraduccion()[9];
        this.literalSingular = this.servicio.rTraduccion()[10];
        this.literalPlural = this.servicio.rTraduccion()[11];
        this.literalSingularArticulo = this.servicio.rTraduccion()[12];
        this.iconoGeneral = "i_falla";

        //cálculo de los filtros
        
        sentencia = "SELECT a.id, a.estatus, a.alarmado_atender, a.alarmado_atendido, a.inicio_atencion, a.fecha, a.fecha AS fechac, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estatus = 0 " + filtroLinea + " " + filtroMaquina + " " + filtroArea + " ORDER BY a.fecha ASC ";
        this.ayudaANDON = this.servicio.rTraduccion()[13]
      }
      else if (tabla == 12)
      {
        this.tituloBuscar = this.servicio.rTraduccion()[9];
        this.literalSingular = this.servicio.rTraduccion()[14];
        this.literalPlural = this.servicio.rTraduccion()[15];
        this.literalSingularArticulo = this.servicio.rTraduccion()[16];
        this.iconoGeneral = "i_revisando" 
        sentencia = "SELECT a.id, a.estatus, a.alarmado_atender, a.alarmado_atendido, a.inicio_atencion, a.fecha, a.inicio_atencion AS fechac, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, c.confirmar_reparacion, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estatus = 10 " + filtroLinea + " " + filtroMaquina + " " + filtroArea + " ORDER BY a.fecha ASC";
        this.ayudaANDON = this.servicio.rTraduccion()[17]
      }
      else if (tabla == 13)
      {
        this.tituloBuscar = this.servicio.rTraduccion()[9];
        this.literalSingular = this.servicio.rTraduccion()[18];
        this.literalPlural = this.servicio.rTraduccion()[19];
        this.literalSingularArticulo = this.servicio.rTraduccion()[20];
        this.iconoGeneral = "i_alerta" 
        sentencia = "SELECT a.id, a.tiemporeparacion, a.estatus, SEC_TO_TIME(a.tiemporeparacion + a.tiempollegada) AS tiempo1, a.alarmado_atender, a.alarmado_atendido, a.inicio_atencion, a.fecha, a.inicio_reporte, a.inicio_reporte AS fechac, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estatus = 100 " + filtroLinea + " " + filtroMaquina + " " + filtroArea + " ORDER BY a.fecha ASC";
        this.ayudaANDON = this.servicio.rTraduccion()[43]
      }
      else if (tabla == 14 || tabla == 15)
      {
        this.tituloBuscar = this.servicio.rTraduccion()[9];
        this.literalSingular = this.servicio.rTraduccion()[44];
        this.literalPlural = this.servicio.rTraduccion()[45];
        this.literalSingularArticulo = this.servicio.rTraduccion()[46];
        this.iconoGeneral = "i_general" 
        sentencia = "SELECT a.id, a.estatus, SEC_TO_TIME(a.tiemporeparacion + a.tiempollegada) AS tiempo1, a.alarmado_atender, a.alarmado_atendido, a.inicio_atencion, a.fecha, CASE WHEN a.estatus = 0 THEN a.fecha WHEN a.estatus = 10 THEN a.inicio_atencion ELSE a.inicio_reporte END AS fechac, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estatus <= " + (this.enTecnico ? "100" :  "10") + filtroLinea + " " + filtroMaquina + " " + filtroArea + " ORDER BY a.fecha " + (tabla == 14 ? " ASC" : " DESC ");
        
        this.ayudaANDON = this.servicio.rTraduccion()[47]
      }
    }
    this.cadSQLActual = sentencia;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.botones(true);
      if (tabla == 1)
      {
        this.iconoGeneral = "i_lineas";
        this.tituloBuscar = this.servicio.rTraduccion()[48];
        this.ayudaANDON = this.servicio.rTraduccion()[49]
      }
      else if (tabla == 2)
      {
        this.iconoGeneral = "i_maquina";
        this.tituloBuscar = this.servicio.rTraduccion()[50];
        this.ayudaANDON = this.servicio.rTraduccion()[51]
        this.todasLasAreas = resp[0].area == 'S';
      }
      else if (tabla == 3)
      {
        this.iconoGeneral = "i_responsable";
        this.tituloBuscar = this.servicio.rTraduccion()[52];
        this.ayudaANDON = this.servicio.rTraduccion()[53]
      }
      else if (tabla == 4)
      {
        this.tituloBuscar = this.servicio.rTraduccion()[54];
        this.iconoGeneral = "i_falla";
        this.ayudaANDON = this.servicio.rTraduccion()[55]
      } 
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        if (tabla == 1)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[56];
        }
        else if (tabla == 2)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[57];
        }
        else if (tabla == 3)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[58];
        }
        else if (tabla == 4)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[59];
        }
        else if (tabla == 11)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[60];
        }
        else if (tabla == 12)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[61];
        }
        else if (tabla == 13)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[62];
        }
        else 
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[63];
        }
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (resp.length == 1 && tabla <= 3 && !this.desdeBoton)
      {
        
        //this.registros = resp; 
        //this.arrFiltrado = resp; 
        //this.seleccion(tabla * -1);
        this.visualizarImagen = true;
        //this.arreHover.length = 1;
        this.prevalidar(tabla + 1);
      }
      else
      {
        this.registros = resp; 
        this.arrFiltrado = resp; 
        this.arreTiempos.length = resp.length;
        this.mostrarDetalle = true;  
        this.arreHover.length = resp.length;
        
        setTimeout(() => {
          this.visualizarImagen = true;
          this.contarRegs();
          if (this.aceptarBoton)
          {
            this.servicio.activarSpinner.emit(false);  
          }
          
          this.animando = true;  
          this.noLeer = false;     
          this.leerBD();
        }, 100);
      }
      this.cambiarVista(this.parametroVista);
      this.desdeBoton = false;
      this.buscar();
      if (this.miSeleccion >= 11)
      {
        this.revisarTiempo();
      } 
    }, 
    error => 
    {
      console.log(error)
    })
  }

  rFallas()
  {
    this.fallas = [];
    let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_fallas a WHERE (linea = 'S' OR id IN (SELECT falla FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE tipo = 1 AND proceso = " + this.detalle.linea + ")) AND (maquina = 'S' OR id IN (SELECT falla FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE proceso = " + this.detalle.maquina + " AND tipo = 2)) " + (+this.detalle.area > 0 ? " AND (AREA = 'S' OR id IN (SELECT falla FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE proceso = " + this.detalle.area + " AND tipo = 3)) " : "") +  " ORDER BY 2";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        this.fallas = resp;
        this.leerBD();
        
    }, 
    error => 
      {
        console.log(error)
      })
  }


  rHerramentales()
  {
    this.herramentales = [];
    let sentencia = "SELECT a.id, CASE WHEN ISNULL(a.referencia) THEN a.nombre ELSE CONCAT(a.nombre, '" + this.servicio.rTraduccion()[2637] + "', a.referencia, ')') END AS nombre FROM " + this.servicio.rBD() + ".cat_partes a WHERE herramentales = 'S' AND maquinas = 'S' OR id IN (SELECT parte FROM " + this.servicio.rBD() + ".relacion_partes_maquinas WHERE maquina = " + this.detalle.maquina + ") ORDER BY 2"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        resp.splice(0, 0, {id: 0, nombre: this.servicio.rTraduccion()[64]});
        this.herramentales = resp; 
        this.detalle.herramental = 0;
        this.detalle.parte = this.servicio.rTraduccion()[64];
        this.leerBD();
        
    }, 
    error => 
      {
        console.log(error)
      })
  }

  iniciar()
  {
    this.enTecnico = false;
    this.afecta_oee = "S"
    this.modelo = this.modelo == 1 ? 1 : 11;
    this.miSeleccion = 1;
    this.servicio.mensajeInferior.emit("");
    this.laSeleccion[0] = 0;
    this.laSeleccion[1] = 0;
    this.laSeleccion[2] = 0;
    this.laSeleccion[3] = 0;
    this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[2] + "]";
    this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3] + "]";
    this.laSeleccion[6] = "[" + this.servicio.rTraduccion()[4] + "]";
    this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
    this.laSeleccion[8] = "";
    this.laSeleccion[9] = "";
    this.laSeleccion[10] = "";
    this.laSeleccion[11] = "";
    this.boton02 = false;
    this.boton03 = false;
    this.boton04 = false;
    this.boton04 = false;
  }

  reportes(id: number)
  {
    if (id != 15)
    {
      this.enTecnico = true;
      this.servicio.cierreSnack.emit(false);
    }
    else
    {
      this.enTecnico = false;
    }
    this.noLeer = false;
    
    this.miSeleccion = id;
    
    let sentencia = "UPDATE " + this.servicio.rBD() + ".cat_usuarios SET ultimo_reporte = " + (this.miSeleccion - 11) + " WHERE id = " + this.servicio.rUsuario().id
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.servicio.aUltimoReporte(this.miSeleccion - 11);
    })
    
    if (id != 15)
    {
      this.vistaOperador = false;
      this.enTecnico = true;
    }
    else
    {
      this.vistaOperador = true;
      this.enTecnico = false;
    }
    this.tituloBuscar = this.servicio.rTraduccion()[9];
    this.rRegistros(this.miSeleccion);
    this.leerBD();
  }

  deshacerEdicion(parametro: number, desde: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "600px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[21], tiempo: 0, mensaje: this.servicio.rTraduccion()[22] + (!this.repVencido ? this.servicio.rTraduccion()[23] + this.servicio.fecha(2, this.horaReporte, this.servicio.rIdioma().fecha_02) + this.servicio.rTraduccion()[24] : this.servicio.rTraduccion()[25]) + this.servicio.rTraduccion()[26], alto: "60", id: 0, accion: 0, botones: 3, boton1STR: this.servicio.rTraduccion()[27], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[28], icono2: "i_cancelar", boton3STR: this.servicio.rTraduccion()[29], icono3: "i_edicion", icono0: "i_alerta" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (!result)
      {
        setTimeout(() => {
          this.txtNotas.nativeElement.focus();
        }, 500);
        return;
      }
      if (result.accion == 1) 
      {
        this.guardar();
      }
      else if (result.accion == 2) 
      {
        this.cancelarEdicion = true;
        this.edicionCancelada();     
        this.miSeleccion = this.origenReporte;
        this.parametroVista = 0
        if (this.servicio.rUsuario().preferencias_andon.substr(this.miSeleccion - 7, 1) == "1")
        {
          this.modelo = this.modelo >= 10 ? 2 : 12;
          this.ayuda11 = this.servicio.rTraduccion()[0]
          this.iconoVista = "i_vdetalle"
          this.verTabla = false;
        }
        else
        {
          this.modelo = this.modelo >= 10 ? 3 : 13; 
          this.ayuda11 = this.servicio.rTraduccion()[1]
          this.iconoVista = "i_vcuadro"
          this.verTabla = true;
        }
        if (this.configuracion.recuperar_sesion=="N")
        {
          if (this.servicio.rUsuarioAnterior().id == 0 || this.servicio.rUsuarioAnterior() == 0)
          {
            this.servicio.cSesion.emit(true);
            return;
          }
          this.servicio.aUsuario(this.servicio.rUsuarioAnterior());
          this.servicio.cambioUsuario.emit(true);
          this.vistaOperador = true;
          if (this.configuracion.ver_reportes_final=="S")
          {
            this.reportes(15);
          }
          else
          {
            this.cambiarVista(0);
            this.prevalidar(1);
            this.contarRegs()
          }
        }
        //this.rRegistros(this.miSeleccion);
      }
      else
      {
        setTimeout(() => {
          this.txtNotas.nativeElement.focus();
        }, 500);
      }
    });
  }


  regresar(id: number)
  {
    this.servicio.cierreSnack.emit(false);
    if (id == 0)
    {
      if (this.editando && !this.cancelarEdicion)
      {
        
        this.deshacerEdicion(0, 1)
        return;
      }
      else
      {
        this.desdeBoton = true;
        this.miSeleccion = 13;
        this.parametroVista = 0;
        this.rRegistros(13);
      }
    }
    else if (id == 99)
    {
      this.llamar(1);
    }
    else
    {
      this.desdeBoton = true;
      this.miSeleccion = id;
      this.parametroVista = 0;
      this.rRegistros(this.miSeleccion);
    }
  }

  imagenError(id: number)
  {
    this.registros[id].mostrarImagen = "N";
  }

  seleccion(id: number)
  {
    this.servicio.cierreSnack.emit(false);
    if (id < 0) 
    {
      id = 0;
    }
    if (this.miSeleccion <= 3)
    {
      this.laSeleccion[3] = 0;
      this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
      this.laSeleccion[11] = "";
    }
    this.laSeleccion[this.miSeleccion - 1] = this.registros[id].id;
    this.laSeleccion[this.miSeleccion + 3] = this.registros[id].nombre;
    this.laSeleccion[this.miSeleccion + 7] = this.registros[id].url_mmcall;
    if (this.miSeleccion == 4)
    {
      this.afecta_oee = this.registros[id].afecta_oee;
    }

    if (this.miSeleccion < 4)
    {
      this.prevalidar(this.miSeleccion + 1);
    }
    else if (this.laSeleccion[0] != "" && this.laSeleccion[1] != "" && this.laSeleccion[2] != "" && this.laSeleccion[3] != "")
    {
      this.llamar(1);
    }
   }

  seguirFiltrando()
  {
    this.sondeo = 0;
    this.noLeer = true;
    this.animando = false;
    this.textoBuscado = this.textoBuscar;
    this.registros = this.aplicarFiltro(this.textoBuscado);
    setTimeout(() => {
      this.animando = true;  
    }, 200);
    
    this.contarRegs(); 
    this.noLeer = false;   
  }    

  completarFalla()
  {
    this.boton01 = true;
    this.boton02 = true; 
    this.boton03 = true; 
    this.boton04 = true; 
    let sentencia = "";
    for (var i = 0; i < 11; i++)
    {
      this.laSeleccion[i] = this.laSeleccionTMP[i];
    }
    if (this.laSeleccion[0] != "" && this.laSeleccion[1] != "" && this.laSeleccion[2] != "")
    {
      this.llamar(1);
    }
  }

  validarFalla(accion: number, linea: number, maquina: number, area: number)
  {
    let sentencia = "";
    if (accion == 1)
    {
      if (this.servicio.rUsuario().linea != "S" && linea > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_,, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_lineas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 1 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.id = " + linea;
      }
      else if (linea > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_lineas a WHERE a.estatus = 'A' AND a.id = " + linea;
      }
      else if (this.servicio.rUsuario().linea != "S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_lineas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 1 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A';"
      }
      else
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_lineas a WHERE a.estatus = 'A';"
      }
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0 && area > 0)
        {
          this.laSeleccionTMP[0] = resp[0].id;
          this.laSeleccionTMP[4] = resp[0].nombre;
          this.laSeleccionTMP[8] = resp[0].url_mmcall;
          this.validarFalla(2, linea, maquina, area);
        }
        else if (resp.length == 1)
        {
          this.laSeleccionTMP[0] = resp[0].id;
          this.laSeleccionTMP[4] = resp[0].nombre;
          this.laSeleccionTMP[8] = resp[0].url_mmcall;
          this.validarFalla(2, linea, maquina, area);
        }
        else if (resp.length > 0)
        {
          this.miSeleccion = 1;
          this.laSeleccion[0] = 0;
          this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[2] + "]";
          this.laSeleccion[8] = "";
          this.boton02 = false;
          this.parametroVista = 0;
          this.rRegistros(1);
        }
        else
        {
          this.seguirFiltrando();
        }
      })      
    }
    else if (accion == 2)
    {
      if (this.servicio.rUsuario().maquina != "S" && maquina > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_maquinas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 2 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.id = " + maquina;
      }
      else if (maquina > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_maquinas a WHERE a.estatus = 'A' AND a.id = " + maquina;
      }
      else if (this.servicio.rUsuario().maquina != "S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_maquinas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 2 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A';"
      }
      else
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_maquinas a WHERE a.estatus = 'A';"
      }
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0 && maquina > 0)
        {
          this.laSeleccionTMP[1] = resp[0].id;
          this.laSeleccionTMP[5] = resp[0].nombre;
          this.laSeleccionTMP[9] = resp[0].url_mmcall;
          this.validarFalla(3, linea, maquina, area);
        }
        else if (resp.length == 1)
        {
          this.laSeleccionTMP[1] = resp[0].id;
          this.laSeleccionTMP[5] = resp[0].nombre;
          this.laSeleccionTMP[9] = resp[0].url_mmcall;
          this.validarFalla(3, linea, maquina, area);
        }
        else if (resp.length > 0)
        {
          this.miSeleccion = 2;
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3] + "]";
          this.laSeleccion[9] = "";
          this.boton02 = true;
          this.parametroVista = 0;
          this.rRegistros(2);
        }
        else
        {
          this.seguirFiltrando();
        }
      })
    }
    else if (accion == 3)
    {
      if (this.servicio.rUsuario().area != "S" && area > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_areas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 3 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.andon = 'S' AND a.id = " + area;
      }
      else if (area > 0)
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.estatus = 'A' AND a.andon = 'S' AND a.id = " + area;
      }
      else if (this.servicio.rUsuario().area != "S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_areas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 3 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.andon = 'S';"
      }
      else
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.estatus = 'A' AND a.andon = 'S';"
      }
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0 && area > 0)
        {
          this.laSeleccionTMP[2] = resp[0].id;
          this.laSeleccionTMP[6] = resp[0].nombre;
          this.laSeleccionTMP[10] = resp[0].url_mmcall;
          this.completarFalla();
        }
        else if (resp.length == 1)
        {
          this.laSeleccionTMP[2] = resp[0].id;
          this.laSeleccionTMP[6] = resp[0].nombre;
          this.laSeleccionTMP[10] = resp[0].url_mmcall;
          this.completarFalla();
        }
        else if (resp.length > 0)
        {
          this.miSeleccion = 3;
          this.laSeleccion[2] = 0;
          this.laSeleccion[6] = "['" + this.servicio.rTraduccion()[4] + "']";
          this.laSeleccion[10] = "";
          this.boton02 = true;
          this.parametroVista = 0;
          this.rRegistros(3);
        }
        else
        {
          this.seguirFiltrando();
        }
      })
    }
  }

  filtrar()
  {

    if (this.configuracion.usar_clave_falla == "S" && this.textoBuscar.length>0)
    {
      let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".cat_fallas WHERE codigo = '" + this.textoBuscar + "' AND estatus = 'A'";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          this.seguirFiltrando()
        }
        else
        {
          this.laSeleccionTMP[3] = resp[0].id;
          this.laSeleccionTMP[7] = resp[0].nombre;
          this.laSeleccionTMP[11] = resp[0].url_mmcall;
          this.validarFalla(1, resp[0].linea, resp[0].maquina, resp[0].area)
        }
      }, 
      error => 
      {
        console.log(error)
      })
    }
    else
    {
      this.seguirFiltrando()
    }
    
  }

  aplicarFiltro(cadena: string) 
  {
    let tmpRegistros = [];
    this.arreHover = [];
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
    if (this.router.url.substr(0, 6) != "/andon")
    {
      return;
    }
    let mensaje = "";
    
    let cadAdicional: string = (this.registros.length != this.arrFiltrado.length ? this.servicio.rTraduccion()[65].replace("campo_0", this.arrFiltrado.length) : "");
    this.hayFiltro = this.registros.length != this.arrFiltrado.length;
    if (this.registros.length > 0)
    {
      mensaje = this.servicio.rTraduccion()[66] + (this.registros.length == 1 ? " " + this.literalSingular : this.registros.length + " " + this.literalPlural) 
    }
    else
    {
      mensaje = this.servicio.rTraduccion()[67] + this.literalPlural
    }
    let cadAlarmas: string = "";
    if (this.miSeleccion==11 || this.miSeleccion==12 || this.miSeleccion==13 || this.miSeleccion==14 || this.miSeleccion==15)
    {
      this.alarmados = 0;
      for (var i = 0; i < this.registros.length; i++)
      {
        if ((this.registros[i].alarmado_atender == 'S' && this.miSeleccion==11) || (this.registros[i].alarmado_atendido == 'S' && this.miSeleccion==12) || (this.arreTiempos[i] == "00:00:00"  && this.miSeleccion==13))
        {
          this.alarmados = this.alarmados + 1
        }
      }
      if (this.alarmados > 0)
      {
        cadAlarmas = "<span class='resaltar'>" + (this.alarmados == 1 ? this.servicio.rTraduccion()[68] : this.alarmados + this.servicio.rTraduccion()[69]) + "</span>";
      }
    }
    mensaje = mensaje + ' ' + cadAdicional + ' ' + this.mensajePadre + cadAlarmas
    this.servicio.mensajeInferior.emit(mensaje);          
  }

  validarDoble()
  {
    if (this.configuracion.permitir_multiples_reportes!='N')
    {
      this.llamar(2);
      return;
    }
    let sentencia = "SELECT a.id, a.fecha, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.solicitante = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas c ON a.falla = c.id WHERE a.maquina = " + this.laSeleccion[1] + " AND a.area = " + this.laSeleccion[2] + " AND a.estatus <= 10 ";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp. length == 0)
      {
        this.llamar(2);
      }
      else
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[70], mensaje: this.servicio.rTraduccion()[71] + resp[0].id + this.servicio.rTraduccion()[72] + resp[0].nsolicitante + this.servicio.rTraduccion()[73] + resp[0].nombre + this.servicio.rTraduccion()[74] + resp[0].fecha + this.servicio.rTraduccion()[75], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
        });
      }
    })
  }

  llamar(id: number)
  {
    if (id==1)
    {
      this.validarDoble();
    }
    else if (id==2)
    {
      let sentencia = "SELECT CONCAT(key_number, serial) AS mmcall FROM mmcall.locations"
      let campos = {accion: 150, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.clave = resp[0].mmcall;
        }
        else
        {

        }
      })
      this.envioSel = false;
      this.fallaSel = false;
      this.maquinaSel = false;
      this.responsableSel = false;
      this.lineaSel = false;
      this.envioCancelado = false;
      if (this.laSeleccion[0] == 0 ||  this.laSeleccion[1] == 0 || this.laSeleccion[2] == 0 || this.laSeleccion[3] == 0)
      {
        let faltante = "";
        faltante = faltante + (this.laSeleccion[0] == 0 ? this.servicio.rTraduccion()[78] : "");
        faltante = faltante + (this.laSeleccion[1] == 0 ? this.servicio.rTraduccion()[79] : "");
        faltante = faltante + (this.laSeleccion[2] == 0 ? this.servicio.rTraduccion()[80] : "");
        faltante = faltante + (this.laSeleccion[3] == 0 ? this.servicio.rTraduccion()[81] : "");

        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[82], mensaje: this.servicio.rTraduccion()[83] + faltante, alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
        });
        respuesta.afterClosed().subscribe(result => 
        {
          if (result)
          {
            if (result.accion == 1) 
            {

            }
          }
          if (this.laSeleccion[0]==0)
          {
            this.miSeleccion = 1;
          }
          else if (this.laSeleccion[1]==0)
          {
            this.miSeleccion = 2;
          }
          else if (this.laSeleccion[2]==0)
          {
            this.miSeleccion = 3;
          }
          else
          {
            this.miSeleccion = 4;
          }
        }) 
        
      }
      else
      {
        this.miSeleccion = 4;
        if (this.configuracion.confirmar_mensaje_mantto=="S")
        {
          this.laSeleccion[8] = !this.laSeleccion[8] ? this.servicio.rTraduccion()[8] : this.laSeleccion[8];
          this.laSeleccion[9] = !this.laSeleccion[9] ? this.servicio.rTraduccion()[8] : this.laSeleccion[9];
          this.laSeleccion[10] = !this.laSeleccion[10] ? this.servicio.rTraduccion()[8] : this.laSeleccion[10];
          this.laSeleccion[11] = !this.laSeleccion[11] ? this.servicio.rTraduccion()[8] : this.laSeleccion[11];
          let urlFinal = this.configuracion.url_mmcall;
          if (this.configuracion.accion_mmcall == "S")
          {
            urlFinal = urlFinal + (this.laSeleccion[8] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[8] : "");
            urlFinal = urlFinal + (this.laSeleccion[9] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[9] : "");
            urlFinal = urlFinal + (this.laSeleccion[10] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[10] : "");
            urlFinal = urlFinal + (this.laSeleccion[11] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[11] : "");
            
          }
          else
          {
            urlFinal = (this.laSeleccion[8] != this.servicio.rTraduccion()[8] ? this.laSeleccion[8] : urlFinal);
            urlFinal = (this.laSeleccion[9] != this.servicio.rTraduccion()[8] ? this.laSeleccion[9] : urlFinal);
            urlFinal = (this.laSeleccion[10] != this.servicio.rTraduccion()[8] ? this.laSeleccion[10] : urlFinal);
            urlFinal = (this.laSeleccion[11] != this.servicio.rTraduccion()[8] ? this.laSeleccion[11] : urlFinal);
          }
          if (this.configuracion.ip_localhost)
          {
            urlFinal = urlFinal.replace(/localhost:8081/gi, this.configuracion.ip_localhost);
          }
          let faltante = "";
          faltante = faltante + this.servicio.rTraduccion()[84] + this.laSeleccion[4] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[85] + this.laSeleccion[5] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[86] + this.laSeleccion[6] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[87] + this.laSeleccion[7] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[88] + (this.configuracion.accion_mmcall == "S" ? this.servicio.rTraduccion()[89] : this.servicio.rTraduccion()[90]) + "</strong>";
          if (!this.movil)
            {
              faltante = faltante + this.servicio.rTraduccion()[91] + urlFinal;
            }
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "500px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[92], mensaje: this.servicio.rTraduccion()[93] + faltante, id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_falla" }
          });
          respuesta.afterClosed().subscribe(result => 
          {
            if (result)
            {
              if (result.accion == 1) 
              {
                this.hacerLlamada();
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[94];
                mensajeCompleto.tiempo = 2000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.envioCancelado = true;
              }
            }
            else
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[94];
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.envioCancelado = true;
            }
          })
        }
        else
        {
          this.hacerLlamada();
        }
      }
    }
    
  }

  rConfiguracion()
  {
    this.configuracion = [];
    this.servicio.consultasBD({accion: 100, sentencia: "/configuracion/10"}).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        if (!this.configuracion.tiempo_reporte)
        {
          this.configuracion.tiempo_reporte = 3600;

        }
        else if (+this.configuracion.tiempo_reporte <= 0)
        {
          this.configuracion.tiempo_reporte = 3600;

        } 
        resp[0].version = 1;
        this.configuracion = resp[0];         
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  hacerLlamada()
  {
    if (!this.aceptarBoton)
    {
      return;
    }
    
    let urlFinal = this.configuracion.url_mmcall;
    if (this.configuracion.accion_mmcall == "S")
    {
      urlFinal = urlFinal + (this.laSeleccion[8] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[8] : "");
      urlFinal = urlFinal + (this.laSeleccion[9] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[9] : "");
      urlFinal = urlFinal + (this.laSeleccion[10] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[10] : "");
      urlFinal = urlFinal + (this.laSeleccion[11] != this.servicio.rTraduccion()[8] ? ";" + this.laSeleccion[11] : "");
      
    }
    else
    {
      urlFinal = (this.laSeleccion[8] != this.servicio.rTraduccion()[8] ? this.laSeleccion[8] : urlFinal);
      urlFinal = (this.laSeleccion[9] != this.servicio.rTraduccion()[8] ? this.laSeleccion[9] : urlFinal);
      urlFinal = (this.laSeleccion[10] != this.servicio.rTraduccion()[8] ? this.laSeleccion[10] : urlFinal);
      urlFinal = (this.laSeleccion[11] != this.servicio.rTraduccion()[8] ? this.laSeleccion[11] : urlFinal);
    }
    if (this.configuracion.ip_localhost)
    {
      urlFinal = urlFinal.replace(/localhost:8081/gi, this.configuracion.ip_localhost);
    }
    
    let str = (this.servicio.rVersion().modulos[9] == 1 ? "ANDON " : "") + this.laSeleccion[5] + " " + this.laSeleccion[7];
    if (urlFinal==this.servicio.rTraduccion()[8])
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[82], mensaje: this.servicio.rTraduccion()[95], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
      });
    }
    else
    {
      str = this.servicio.tildes(str, "M").substr(0, 40);
      str = str.replace(/[&\/\\()$~%.'":*#?<>{}]/g, " ");
      let destinos =  urlFinal.split(";");
      this.tEnviados = 0;
      let buenos: number = 0;
      this.grabar();
      this.noLicenciados = 0;
      setTimeout(() => {
        this.finalizaLlamada()
      }, 1500);
      for (var i = 0; i < destinos.length; i++)
      {
        
        if (destinos[i].length > 0)
        {
          let numeroRadio = "";
          let posRadio = destinos[i].indexOf("number=");
          if (posRadio == -1)
          {
            posRadio = destinos[i].indexOf("division=");
            if (posRadio == -1)
            {
              numeroRadio = destinos[i]
            }
            else
            {
              numeroRadio = "D" + destinos[i].substr(posRadio + 9);
            }
          }
          else
          {
            numeroRadio = destinos[i].substr(posRadio + 7);
          }
          if (numeroRadio.length > 0)
          {
            let sentencia = "SELECT " + i + " AS numero, tipo, mmcall, cronos FROM " + this.servicio.rBD() + ".licencias WHERE tipo = 'R' AND mmcall = '" + numeroRadio + "'";
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              if (resp.length > 0)
              {
                this.local = resp[0].mmcall;
                this.tipo = resp[0].tipo;
                this.generarClave()
                let validada = true;
                let cadComparar = "";
                for (var jj = 0; jj < this.clavePublica.length; jj++) 
                {
                  let numero = (this.clavePublica[jj].charCodeAt(0) ^ this.claveInterna[jj].charCodeAt(0)).toString();
                  if (numero.length == 1)
                  {
                    cadComparar = numero;
                  }
                  else if (numero.length == 2)
                  {
                    cadComparar = numero.substr(1);
                  }
                  else if (numero.length == 3)
                  {
                    cadComparar = numero.substr(1, 1);
                  }
                  if (cadComparar != resp[0].cronos[jj])
                  {
                    validada = false;
                    break;
                  }
                }
                if (validada || this.configuracion.pagers_val=='N')
                {
                  let campos = {accion: 300, url: destinos[+resp[0].numero], mensaje: str, pager: numeroRadio};  
                  this.servicio.llamadaMMCall(campos).subscribe( resp =>
                  {
                    this.tEnviados =  this.tEnviados + 1;
                    if (resp == "success")
                    {
                      buenos = buenos + 1;            
                    }
                    
                  })
                } 
                else
                {
                  this.tEnviados =  this.tEnviados + 1;
                  this.noLicenciados = this.noLicenciados + 1;
                }
                
              }
              else
              {
                if (this.configuracion.pagers_val=='N')
                {
                  let campos = {accion: 300, url: destinos[i], mensaje: str, pager: numeroRadio};  
                  this.servicio.llamadaMMCall(campos).subscribe( resp =>
                  {
                    this.tEnviados =  this.tEnviados + 1;
                    if (resp == "success")
                    {
                      buenos = buenos + 1;            
                    }
                    
                  })
                } 
                else
                {
                  this.tEnviados =  this.tEnviados + 1;
                }
              }
            })
          }         
        }
      }
      
    }  
  }

  grabar()
  {
    if (this.secuencia == 0)
    {
      let sentencia = "SELECT turno_secuencia FROM " + this.servicio.rBD() + ".configuracion";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.secuencia = resp[0].turno_secuencia;
        this.secuencia = +this.secuencia == 0 ? +this.servicio.rTurno().id : +this.secuencia;
        this.secuencia = +this.secuencia == 0 ? 1 : +this.secuencia;
        this.grabar();
      })
      return;
    }
    
    let estaFecha = this.servicio.fecha(1, '', 'yyyy-MM-dd')
    let estaHora = this.servicio.fecha(1, '', 'HH:mm:ss')
    if (this.servicio.rTurno().cambidia =="S")
    {
      if (this.servicio.rTurno().mover =="2" && estaHora >= this.servicio.rTurno().inicia && estaHora <= "23:59:59")
      {
        let date = new Date();
        date.setDate(date.getDate() + 1);
        estaFecha = this.servicio.fecha(2, '' + new Date(date) , 'yyyy-MM-dd')
      }
      else if (this.servicio.rTurno().mover =="1"  && estaHora >= "00:00:00" && estaHora <= this.servicio.rTurno().termina)
      {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        estaFecha = this.servicio.fecha(2, '' + new Date(date) , 'yyyy-MM-dd')
      }
    }
    let sentencia = "INSERT INTO " + this.servicio.rBD() + ".reportes (linea, maquina, area, falla, falla_ajustada, solicitante, turno, fecha_reporte, mmcall, afecta_oee, secuencia) VALUES(" + this.laSeleccion[0] + ", " + this.laSeleccion[1] + ", "  + this.laSeleccion[2] + ", "  + this.laSeleccion[3] + ", " + this.laSeleccion[3] + ", " + this.servicio.rUsuario().id + ", " + this.servicio.rTurno().id + ", '" + estaFecha + "', NOW(), '" + (this.afecta_oee ? this.afecta_oee : "S") + "', " + +this.secuencia + ")";
    this.secuencia = 0;
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {

      sentencia = "UPDATE " + this.servicio.rBD() + ".cat_fallas SET ultima_incidencia = NOW() WHERE id = " + this.laSeleccion[3]
      campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
      })
          
      sentencia = "SELECT id, fecha FROM " + this.servicio.rBD() + ".reportes ORDER BY id DESC LIMIT 1";
      campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (this.configuracion.mostrar_numero=="S")
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[96], mensaje: this.servicio.rTraduccion()[97] + "<strong>" + +resp[0].id + "</strong>", alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
  
        }
        else
        {
          this.aceptarBoton = false;
          this.servicio.activarSpinner.emit(true);
          setTimeout(() => {
            this.servicio.activarSpinner.emit(false);  
            this.aceptarBoton = true;
          }, 200);  
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[97] + " " + resp[0].id
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        if (this.configuracion.ver_reportes_final=="S")
        {
          this.servicio.mensajeInferior.emit("");
          this.laSeleccion[0] = 0;
          this.laSeleccion[1] = 0;
          this.laSeleccion[2] = 0;
          this.laSeleccion[3] = 0;
          this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[2] + "]";
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3] + "]";
          this.laSeleccion[6] = "[" + this.servicio.rTraduccion()[4] + "]";
          this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
          this.laSeleccion[8] = "";
          this.laSeleccion[9] = "";
          this.laSeleccion[10] = "";
          this.laSeleccion[11] = "";
          this.boton02 = false;
          this.boton03 = false;
          this.boton04 = false;
          this.boton04 = false;
          this.reportes(15)
        }
        else
        {

          this.cambiarVista(0);
          this.prevalidar(1);
          this.contarRegs()
        }
        
      })
    })    
  }

  cambiarVista(modo: number)
  {
    this.animando = false;
    this.sondeo = 0;
    let vistaRecuadro: boolean = false;
    if (modo == 1)
    {
      vistaRecuadro = (this.modelo == 13 || this.modelo == 3) && modo == 1;
      //if (this.vistaOperador)
      //{
        this.servicio.guardarVista(this.indicePreferencia, (vistaRecuadro ? 1: 0))
      //}
      //else
      //{
       // this.servicio.guardarVista(this.indicePreferencia - 6, (vistaRecuadro ? 1: 0))
      //}
    }
    //else if (this.vistaOperador)
    //{
    //  vistaRecuadro = this.servicio.rUsuario().preferencias_andon.substr(this.indicePreferencia - 1, 1) == "1";
    //}
    else
    {
      vistaRecuadro = this.servicio.rUsuario().preferencias_andon.substr(this.indicePreferencia - 1, 1) == "1";
    }
    if (vistaRecuadro)
    {
      this.modelo = this.modelo == 13 ? 12 : this.modelo;
      if (!this.iniciado || this.modelo == 3)
      {
        this.modelo = 2;
      }
        this.ayuda11 = this.servicio.rTraduccion()[0]
      this.iconoVista = "i_vdetalle"
      this.verTabla = false;
    }
    else
    {
      this.modelo = this.modelo == 12 ? 13 : this.modelo;
      if (!this.iniciado || this.modelo == 2)
      {
        this.modelo = 3;
      }
      this.ayuda11 = this.servicio.rTraduccion()[1]
      this.iconoVista = "i_vcuadro"
      this.verTabla = true;
    }
    this.iniciado = true;  
    //Se graba la vista
    
    setTimeout(() => {
      this.animando = true;
    }, 300);
  }

  cadaSegundo()
  {
    if (this.miSeleccion == 21 && +this.configuracion.tiempo_reporte > 0)
    {
      let segundos =  this.servicio.tiempoTranscurrido(this.horaReporte, "FS").split(";")[3];
      if (+segundos > 0)
      {
        this.repVencido = false;
        let cadSegundos =  this.servicio.tiempoTranscurrido(this.horaReporte, "F").split(";");
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[98] + cadSegundos[1] + ":" + (+cadSegundos[2] < 10 ? "0" + cadSegundos[2] : cadSegundos[2]) + ":" + (+cadSegundos[3] < 10 ? "0" + cadSegundos[3] : cadSegundos[3]) + "</<span")
      }
      else
      {
        this.rAlarmado = "S";
        this.repVencido = true;
        this.servicio.mensajeInferior.emit("<span class='resaltar'>" + this.servicio.rTraduccion()[99] + "</span>")
      }
      
      this.enCadaSegundo = false;
    }
    else if (this.miSeleccion >= 11)
    {
      this.revisarTiempo()
        //this.enCadaSegundo = false;
    }      
  }

  
  revisarTiempo()
  {
    this.contarTiempo = false;
    for (var i = 0; i < this.registros.length; i++)
      {
        if (this.registros[i].estatus == 100) 
        {
          let tmpHora;
          tmpHora = new Date(this.registros[i].fechac);
          tmpHora = new Date(tmpHora.getTime() + +this.configuracion.tiempo_reporte * 1000)
    
          let segundos =  this.servicio.tiempoTranscurrido(tmpHora, "FS").split(";")[3];
          if (+segundos > 0)
          {
            let cadSegundos =  this.servicio.tiempoTranscurrido(tmpHora, "F").split(";");
            this.arreTiempos[i] = cadSegundos[1] + ":" + (+cadSegundos[2] < 10 ? "0" + cadSegundos[2] : cadSegundos[2]) + ":" + (+cadSegundos[3] < 10 ? "0" + cadSegundos[3] : cadSegundos[3]);
          }
          else
          {
            this.arreTiempos[i] = "00:00:00";
          }
          
        }
        else
        {
          let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].fechac, "").split(";");
          this.arreTiempos[i] = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
        }
        this.contarTiempo = true;
      }

    }

  leerBD()
  {
    if (this.configuracion.ver_reportes_final=='S')
    {
      this.totales();
    }
    if (this.noLeer || this.router.url.substr(0, 6) != "/andon"  || (!this.enTecnico && this.miSeleccion != 15))
    {
      return;
    }
    this.totales();
    let campos = {accion: 100, sentencia: this.cadSQLActual};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        this.arrFiltrado = resp;
      let arreTemp: any = this.arrFiltrado;
      if (this.hayFiltro)
      {
        arreTemp = this.aplicarFiltro(this.textoBuscado);
      }
      let actualizar: boolean = false; 
      actualizar = JSON.stringify(this.registros) != JSON.stringify(arreTemp);
      if (actualizar)
      {
        if (resp.length == 0)
        {
          this.registros = [];
        }
        if (this.arrFiltrado.length == 0 && resp.length > 0)
        {
          this.registros = arreTemp;
        }
        else 
        {
          for (i = this.registros.length - 1; i >= 0; i--)
          {
            let hallado = false;
            if (this.miSeleccion != 14)
            {
              for (var j = arreTemp.length - 1; j >= 0 ; j--)
              {
                if (this.registros[i].id ==  arreTemp[j].id && this.registros[i].estatus ==  arreTemp[j].estatus)
                {
                  if (this.miSeleccion != 13)
                  {
                    if (this.registros[i].alarmado_atendido !=  arreTemp[j].alarmado_atendido || this.registros[i].alarmado_atender !=  arreTemp[j].alarmado_atender)
                    {
                      this.registros[i].alarmado_atendido = arreTemp[j].alarmado_atendido;
                      this.registros[i].alarmado_atender = arreTemp[j].alarmado_atender;
                    }
                  }
                  hallado = true;
                  break;
                }
              }
               
            }
            else
            {
              for (var j = arreTemp.length - 1; j >= 0 ; j--)
              {
                if (this.registros[i].id ==  arreTemp[j].id)
                {
                  if (this.registros[i].estatus != arreTemp[j].estatus || this.registros[i].alarmado_atendido !=  arreTemp[j].alarmado_atendido || this.registros[i].alarmado_atender !=  arreTemp[j].alarmado_atender || this.registros[i].fecha != arreTemp[j].fecha|| this.registros[i].inicio_reporte != arreTemp[j].inicio_reporte || this.registros[i].inicio_atencion != arreTemp[j].inicio_atencion)
                  {
                    this.registros[i].alarmado_atendido = arreTemp[j].alarmado_atendido;
                    this.registros[i].alarmado_atender = arreTemp[j].alarmado_atender;
                    this.registros[i].fecha = arreTemp[j].fecha;
                    this.registros[i].inicio_reporte = arreTemp[j].inicio_reporte;
                    this.registros[i].inicio_atencion = arreTemp[j].inicio_atencion;
                    this.registros[i].estatus = arreTemp[j].estatus;
                  }
                  hallado = true;
                  break;
                }
              }
            }
            if (!hallado)
            {
              this.registros.splice(i, 1);
              this.arreTiempos.length = resp.length;
              this.arreHover.length = resp.length;
            }
          }
          for (var i = 0; i < arreTemp.length; i++)
          {
            let agregar = true;
            for (var j = 0; j < this.registros.length; j++)
            {
              if (this.registros[j].id == arreTemp[i].id)
              {
                agregar = false
                break;              
              }
            }
            if (agregar)
            {
              this.registros.splice(i, 0, arreTemp[i])
              this.arreTiempos.length = resp.length;
              this.arreHover.length = resp.length;
              this.sondeo = arreTemp[i].id;
      
            }
          }
          
        }
        this.contarRegs()
      }
      clearTimeout(this.leeBD);
      if (this.router.url.substr(0, 6) == "/andon" && (this.enTecnico ||this.miSeleccion == 15))
      {
        this.leeBD = setTimeout(() => {
          this.leerBD()
        }, +this.elTiempo);
      }
    });
  }

  atender(id: number)
  {
    if (!this.enTecnico)
    {
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-error";
      if (this.registros[id].estatus == 0)
      {
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[100]
      }
      else if (this.registros[id].estatus == 10)
      {
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[101]
      }
      else
      {
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[102]
      }
      
      mensajeCompleto.tiempo = 3000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      return;
    }
    this.servicio.cierreSnack.emit(false);
    this.reporteSeleccionado = this.registros[id].id;
    if (this.registros[id].estatus == 0 && this.registros[id].origen == 0)
    {
      this.reparar(id);
    }  
    else if (this.registros[id].estatus == 0)
    {
      this.vienedeMMCall();
    }
    else if (this.registros[id].estatus == 10)
    {
      this.previoCerrar(id);
    }
    else if (this.registros[id].estatus == 100)
    {
      this.documentacion(id);
    }
  }

  documentacion(id: number)
  {
    let sentencia = "SELECT a.linea, a.maquina, a.area, a.inicio_reporte, a.falla AS falla_ajustada, a.id, a.fecha, a.inicio_atencion, a.cierre_atencion, a.origen, a.tiemporeparacion, SEC_TO_TIME(a.tiemporeparacion) AS tiempo1, SEC_TO_TIME(a.tiemporeparacion + a.tiempollegada) AS tiempo2, SEC_TO_TIME(a.tiempollegada) AS tiempo3, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nconfirmador, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ndpto, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales g ON f.departamento = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.confirmado = h.id WHERE a.id = " + this.reporteSeleccionado;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.noLeer = true;
      this.detalle = resp[0];
      this.qrvalue = '' + this.detalle.id;
      this.iniciarEliminacion = 0;

      this.origenReporte = 13;
      this.guardando = false;
      this.editando = true;
      this.rFallas();
      this.rHerramentales();
      this.buscarDatos(2, this.detalle.falla_ajustada)
      this.llenarListas(1, this.servicio.rBD() + ".cat_generales", "WHERE tabla = 60 AND estatus = 'A'", id); 
      this.rAlarmado = "N";
      this.miSeleccion = 21;
      this.cancelarEdicion = false;
      this.modelo = this.modelo >= 10 ? 4 : 14;
      this.detalle.contabilizar = "S";
      this.numeroItem = 3;
      if (this.servicio.rVersion().tipo != 0 && this.detalle.origen != 0)
      {
        this.numeroItem = 4;
      }
      this.verTabla = false;
      this.notas = "";
      this.horaReporte = new Date(this.detalle.inicio_reporte);
      this.horaReporte = new Date(this.horaReporte.getTime() + +this.configuracion.tiempo_reporte * 1000)
      this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[103])
      setTimeout(() => {
        this.txtNotas.nativeElement.focus();
      }, 500);
    })      
  }


  vienedeMMCall()
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "320px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[104], tiempo: 0, mensaje: this.servicio.rTraduccion()[105], id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_mmcall" }
    });
  }

  reparar(id: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "500px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[3393], tiempo: 0, mensaje: this.servicio.rTraduccion()[114].replace("campo_0", this.reporteSeleccionado), id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[3394], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_responsable" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        if (result.accion == 1) 
        {
          let sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET tecnicoatend = " + +this.servicio.rUsuario().id + ", estatus = 10, inicio_atencion = CASE WHEN NOW() < fecha THEN DATE_ADD(fecha, INTERVAL 5 SECOND) ELSE NOW() END, tiempollegada = TIME_TO_SEC(TIMEDIFF(NOW(), fecha)) WHERE id = " + this.reporteSeleccionado;
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-normal";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[3395].replace("campo_0", this.reporteSeleccionado).replace("campo_1", this.servicio.rTraduccion()[442]);
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.leerBD();
          })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[115];
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[115];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
    
  }


  cerrar(id: number)
  { 

    let sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET tecnico = " + +this.servicio.rUsuario().id + " , tecnicoatend = " + +this.servicio.rUsuario().id + " , estatus = 100, cierre_atencion = NOW(), confirmado = " + this.confirmador + ", tiemporeparacion = TIME_TO_SEC(TIMEDIFF(NOW(), inicio_atencion)), inicio_reporte = NOW() WHERE id = " + this.reporteSeleccionado;
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( act =>
    {
      let sentencia = "SELECT a.linea, a.maquina, a.area, falla_ajustada, a.id, a.fecha, a.inicio_atencion, a.cierre_atencion, a.origen, a.tiemporeparacion, SEC_TO_TIME(a.tiemporeparacion) AS tiempo1, SEC_TO_TIME(a.tiemporeparacion + a.tiempollegada) AS tiempo2, SEC_TO_TIME(a.tiempollegada) AS tiempo3, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nconfirmador, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nfalla, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ndpto, a.origen FROM " + this.servicio.rBD() + ".reportes a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas c ON a.maquina = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON a.falla = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales g ON f.departamento = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.confirmado = h.id WHERE a.id = " + this.reporteSeleccionado;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.detalle = resp[0];
        this.qrvalue = '' + this.detalle.id;
        this.detalle.herramental = !this.detalle.herramental ? 0 : this.detalle.herramental;
        this.rFallas();
        this.rHerramentales();
        if (this.detalle.herramental == 0)
        {
          this.detalle.parte = this.servicio.rTraduccion()[64];
        }
        else
        {
          this.buscarDatos(1, this.detalle.herramental)
        }
        this.buscarDatos(2, this.detalle.falla_ajustada)
        this.totales();
        this.llenarListas(1, this.servicio.rBD() + ".cat_generales", "WHERE tabla = 60 AND estatus = 'A'", id); 
        
        this.causaraiz.p1 = "";
        this.causaraiz.p2 = "";
        this.causaraiz.p3 = "";
        this.causaraiz.p4 ="";
        this.causaraiz.p5 = "";
        this.causaraiz.fecha = "";
        this.causaraiz.responsable = "";
        this.causaraiz.departamento = "";
        this.causaraiz.plan = "";
        this.causaraiz.mano_de_obra = "";
        this.causaraiz.medio_ambiente = "";
        this.causaraiz.metodo = "";
        this.causaraiz.material = "";
        this.causaraiz.maquina = "";
        this.causaraiz.comentarios = "";
   
        this.noLeer = true;
        
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        this.editando = true;
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[116].replace("campo_0", this.registros[id].id);
        mensajeCompleto.tiempo = 4000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        this.iniciarEliminacion = 0;
        this.origenReporte = 12;
        this.guardando = false;
        this.rAlarmado = "N";
        this.miSeleccion = 21;
        this.cancelarEdicion = false;
        this.modelo = this.modelo >= 10 ? 4 : 14;
        this.numeroItem = 3;
        if (this.servicio.rVersion().tipo != 0 && this.detalle.origen != 0)
        {
          this.numeroItem = 4;
        }
      
        this.verTabla = false;
        this.notas = "";
        this.horaReporte = new Date();
        this.horaReporte = new Date(this.horaReporte.getTime() + +this.configuracion.tiempo_reporte * 1000)
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[117])
        setTimeout(() => {
          this.txtNotas.nativeElement.focus();
        }, 500);
      })    
    })
  }

  previoCerrar(id: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[118], mensaje: this.servicio.rTraduccion()[119].replace("campo_0", this.reporteSeleccionado), id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[109], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_ok" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        
        if (result.accion == 1) 
        {
          this.confirmador = 0;
          this.maquinaSeleccionado = this.registros[id].confirmar_reparacion;
          this.maquinaSeleccionado = !this.maquinaSeleccionado ? "N" : this.maquinaSeleccionado;
          if (this.maquinaSeleccionado!="S")
          {
            this.cerrar(id);
          }
          else
          {
            let rolBuscar = "S";
            if (this.servicio.rUsuario().rol == rolBuscar || this.servicio.rUsuario().rol == "A")
            {
              this.cerrar(id);
            }
            else
            {
              let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".relacion_usuarios_opciones WHERE usuario = " + this.servicio.rUsuario().id + " AND opcion = 40";
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                if (resp.length > 0)
                {
                  this.cerrar(id);
                }
                else
                {
                  const respuesta = this.dialogo.open(SesionComponent, 
                  {
                    width: "400px", panelClass: 'dialogo', data: { tiempo: 10, sesion: 1, rolBuscar: rolBuscar, opcionSel: 40, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[121], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[122], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
                  });
                  respuesta.afterClosed().subscribe(result => 
                  {
              
                    if (result)
                    {
                      if (result.accion == 1) 
                      {
                        //Se valida que el usuario tenga acceso a la maquina o linea
                        let filtroLinea = ""
                        if (result.conf_linea != "S")
                        {
                          filtroLinea = " AND a.linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + result.idUsuario + ") ";
                        } 
                        let filtroMaquina = ""
                        if (result.conf_maquina!="S")
                        {
                          filtroMaquina = " AND a.maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + result.idUsuario + ") ";
                        } 
                        if (result.conf_linea != "S" && result.conf_maquina !="S")
                        {
                          filtroLinea = " AND (a.linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + result.idUsuario + ") OR a.maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + result.idUsuario + ")) ";
                          filtroMaquina = "";
                        } 
                        sentencia = "SELECT a.id FROM " + this.servicio.rBD() + ".reportes a WHERE a.id =  " + this.reporteSeleccionado + filtroLinea + " " + filtroMaquina + " ORDER BY a.fecha ASC ";
                        let campos = {accion: 100, sentencia: sentencia};  
                        this.servicio.consultasBD(campos).subscribe( actualizado =>
                        {
                          if (actualizado.length > 0)
                          {
                            this.confirmador = result.idUsuario;
                            this.cerrar(id);
                          }
                          else
                          {
                            let mensajeCompleto: any = [];
                            mensajeCompleto.clase = "snack-error";
                            mensajeCompleto.mensaje = this.servicio.rTraduccion()[4374];
                            mensajeCompleto.tiempo = 2000;
                            this.servicio.mensajeToast.emit(mensajeCompleto);
                          }
                        })
                      }
                      else
                      {
                        let mensajeCompleto: any = [];
                        mensajeCompleto.clase = "snack-error";
                        mensajeCompleto.mensaje = this.servicio.rTraduccion()[120];
                        mensajeCompleto.tiempo = 2000;
                        this.servicio.mensajeToast.emit(mensajeCompleto);
                      }
                    }
                    else
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "snack-error";
                      mensajeCompleto.mensaje = this.servicio.rTraduccion()[120];
                      mensajeCompleto.tiempo = 2000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);
                    }
                  }) 
                }
              })
            }  
          }        
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[115];
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[115];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  
  finalizar()
  {
    if (this.editando && !this.cancelarEdicion)
    {
      this.deshacerEdicion(0, 99)
      
      return;
    }
    
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[123], mensaje: this.servicio.rTraduccion()[124].replace("campo_0", this.servicio.rUsuario().nombre), id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[261], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_salir" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        if (result.accion == 1) 
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-normal";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[125].replace("campo_0", this.servicio.rUsuario().nombre);
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          this.servicio.rSesion.emit(1);
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[126].replace("campo_0", this.servicio.rUsuario().nombre);
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[126].replace("campo_0", this.servicio.rUsuario().nombre);
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  guardar()
  {
    this.error01 = false;
    this.error02 = false;
    this.error03 = false;
    this.error04 = false;
    
    let errores = 0;
    this.faltaMensaje = "";
    if (!this.notas)
    {
      errores = errores + 1;
      this.error01 = true;
      this.faltaMensaje = this.servicio.rTraduccion()[127];
      this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[128];
    }
    if ((!this.detalle.area || this.detalle.area==0)  && this.servicio.rVersion().tipo != 0 && this.detalle.origen != 0)
    {
      errores = errores + 1;
      this.error04 = true;
      this.faltaMensaje = !this.faltaMensaje ? this.servicio.rTraduccion()[127] : this.faltaMensaje;
      this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[129];
   }
    if (!this.detalle.falla_ajustada || this.detalle.falla_ajustada==0)
    {
      errores = errores + 1;
      this.error02 = true;
      this.faltaMensaje = !this.faltaMensaje ? this.servicio.rTraduccion()[127] : this.faltaMensaje;
      this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[130];
   }
   else if (this.detalle.falla_ajustada==-1)
   {
     errores = errores + 1;
     this.faltaMensaje = !this.faltaMensaje ? this.servicio.rTraduccion()[127] : this.faltaMensaje;
     this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[3553];
   }
  if ((!this.detalle.tiemporeparacion || this.detalle.tiemporeparacion==0) && this.servicio.rVersion().tipo != 0 && this.detalle.origen != 0 && this.configuracion.hibrido_editar_tiemporeparacion == "S")
    {
      errores = errores + 1;
      this.error03 = true;
      this.faltaMensaje = !this.faltaMensaje ? this.servicio.rTraduccion()[127] : this.faltaMensaje;
      this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[131];
    }
    if (this.detalle.herramental==-1)
    {
      errores = errores + 1;
      this.faltaMensaje = !this.faltaMensaje ? this.servicio.rTraduccion()[127] : this.faltaMensaje;
      this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + this.servicio.rTraduccion()[3552];
    }
    else
    {
      //this.detalle.tiemporeparacion = 0;
    }
    if (errores > 0)
    { 
      setTimeout(() => {
        if (this.error01)
        {
          this.txtNotas.nativeElement.focus();
        }
        else if (this.error04)
        {
          this.lstC11.focus();
        }
        else if (this.error02)
        {
          this.lstC10.focus();
        }
        else if (this.error03)
        {
          this.txtT1.nativeElement.focus();
        }
        else if (this.detalle.falla_ajustada == -1)
        {
          this.txtT9.nativeElement.focus();
        }
        else if (this.detalle.herramental == -1)
        {
          this.txtT10.nativeElement.focus();
        }
      }, 300);
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-error";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[132];
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      return
    }
    this.detalle.contabilizar = this.configuracion.permitir_afectacion != "S" ? "S" : !this.detalle.contabilizar ? "S" : this.detalle.contabilizar;
    let adicional = "";
    if (this.servicio.rVersion().modulos[2] == 1)
    {
      this.causaraiz.p1 = !this.causaraiz.p1 ? "" : this.causaraiz.p1;
      this.causaraiz.p2 = !this.causaraiz.p2 ? "" : this.causaraiz.p2;
      this.causaraiz.p3 = !this.causaraiz.p3 ? "" : this.causaraiz.p3;
      this.causaraiz.p4 = !this.causaraiz.p4 ? "" : this.causaraiz.p4;
      this.causaraiz.p5 = !this.causaraiz.p5 ? "" : this.causaraiz.p5;
      this.causaraiz.fecha = !this.causaraiz.fecha ? "" : this.causaraiz.fecha;
      this.causaraiz.responsable = !this.causaraiz.responsable ? "" : this.causaraiz.responsable;
      this.causaraiz.departamento = !this.causaraiz.departamento ? "" : this.causaraiz.departamento;
      this.causaraiz.plan = !this.causaraiz.plan ? "" : this.causaraiz.plan;
      this.causaraiz.mano_de_obra = !this.causaraiz.mano_de_obra ? "" : this.causaraiz.mano_de_obra;
      this.causaraiz.medio_ambiente = !this.causaraiz.medio_ambiente ? "" : this.causaraiz.medio_ambiente;
      this.causaraiz.metodo = !this.causaraiz.metodo ? "" : this.causaraiz.metodo;
      this.causaraiz.material = !this.causaraiz.material ? "" : this.causaraiz.material;
      this.causaraiz.maquina = !this.causaraiz.maquina ? "" : this.causaraiz.maquina;
      this.causaraiz.comentarios = !this.causaraiz.comentarios ? "" : this.causaraiz.comentarios;
      adicional = ";INSERT INTO " + this.servicio.rBD() + ".causa_raiz (reporte, creado, modificado, creacion, modificacion) VALUES(" + this.detalle.id + ", " + this.servicio.rUsuario().id + ", " + this.servicio.rUsuario().id + ", NOW(), NOW());UPDATE " + this.servicio.rBD() + ".causa_raiz SET p1 = '" + this.causaraiz.p1 + "', p2 = '" + this.causaraiz.p2 + "', p3 = '" + this.causaraiz.p3 + "', p4 = '" + this.causaraiz.p4 + "', p5 = '" + this.causaraiz.p5 + "', plan = '" + this.causaraiz.plan + "', fecha = '" + this.causaraiz.fecha + "', responsable = '" + this.causaraiz.responsable + "', departamento = '" + this.causaraiz.departamento + "', mano_de_obra = '" + this.causaraiz.mano_de_obra + "', maquina = '" + this.causaraiz.maquina + "', medio_ambiente = '" + this.causaraiz.medio_ambiente + "', metodo = '" + this.causaraiz.metodo + "', material = '" + this.causaraiz.material + "', comentarios = '" + this.causaraiz.comentarios + "' WHERE reporte = " + this.detalle.id
    }
    if (this.servicio.rVersion().modulos[5] == 1)
    {
      adicional = adicional + ";UPDATE " + this.servicio.rBD() + ".detalleparos SET tipo = (SELECT agrupador_2 FROM " + this.servicio.rBD() + ".cat_fallas WHERE id = " +this.detalle.falla_ajustada + "), paro = CONCAT('ANDON ', (SELECT nombre FROM " + this.servicio.rBD() + ".cat_fallas WHERE id = "+ this.detalle.falla_ajustada + ")), resultados = '" + this.notas.substring(0, 100) + "' WHERE reporte = " + this.detalle.id; 
    
    }
    this.guardando = true;
    let sqlAdicional: string = "";
    if (this.servicio.rVersion().tipo != 0 && this.detalle.origen != 0)
    {
      sqlAdicional = ", falla = " + +this.detalle.falla_ajustada;
      if (this.configuracion.hibrido_editar_tiemporeparacion == "S")
      {
        sqlAdicional = sqlAdicional + ", tiemporeparacion = " + +this.detalle.tiemporeparacion;
      }
      if (this.detalle.area == 0)
      {
        sqlAdicional = sqlAdicional + ", area = " + +this.detalle.area;
      }
    }
    let sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET detalle = '" + this.notas + "', falla_ajustada = " +  +this.detalle.falla_ajustada + ", herramental = " + +this.detalle.herramental + ", cierre_reporte = NOW(), tipo = " + +this.detalle.tipo + ", estatus = 1000, tiempoatencion = TIME_TO_SEC(TIMEDIFF(NOW(), fecha)), tiemporeporte = TIME_TO_SEC(TIMEDIFF(NOW(), inicio_reporte)), contabilizar = '" + this.detalle.contabilizar + "'" + sqlAdicional + ", tecnico_documento = " + this.servicio.rUsuario().id + " WHERE id = " + this.detalle.id + adicional;
    
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {

      this.guardando = false;
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[133];
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      if (this.servicio.rUsuario().preferencias_andon.substr(this.miSeleccion - 7, 1) == "1")
        {
          this.modelo = this.modelo >= 10 ? 2 : 12;
          this.ayuda11 = this.servicio.rTraduccion()[0]
          this.iconoVista = "i_vdetalle"
          this.verTabla = false;
        }
        else
        {
          this.modelo = this.modelo >= 10 ? 3 : 13; 
          this.ayuda11 = this.servicio.rTraduccion()[1]
          this.iconoVista = "i_vcuadro"
          this.verTabla = true;
        }
        if (this.configuracion.recuperar_sesion=="N")
        {
          if (this.servicio.rUsuarioAnterior().id == 0 || this.servicio.rUsuarioAnterior() == 0)
          {
            this.servicio.cSesion.emit(true);
            return;
          }
          this.servicio.aUsuario(this.servicio.rUsuarioAnterior());
          this.servicio.cambioUsuario.emit(true);
          this.vistaOperador = true;
          if (this.configuracion.ver_reportes_final=="S")
          {
            this.reportes(15);
          }
          else
          {
            this.cambiarVista(0);
            this.prevalidar(1);
            this.contarRegs()
          }
        }
        if (this.configuracion.imprimir_reporte_cerrar=="S")
        {
          this.exportarReporte();
        }
        this.miSeleccion = this.origenReporte;
        this.rRegistros(this.miSeleccion);
        sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET tecnicoatend = tecnico WHERE tecnicoatend = 0 AND id = " + this.detalle.id;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
        })
    })
  }

  getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  exportarReporte()
  {
    const doc = new jsPDF("p", "mm", "letter");
    let sentencia = "SELECT planta, logo_ruta, logo_alto, logo_ancho FROM " + this.servicio.rBD() + ".configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        sentencia = "SELECT c.id, CASE WHEN c.origen = 0 THEN '" + this.servicio.rTraduccion()[2086] + "' ELSE '" + this.servicio.rTraduccion()[1296] + "' END, c.fecha AS fechar, c.fecha_reporte, IFNULL(l.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.estatus as estatusr, c.inicio_atencion, SEC_TO_TIME(c.tiempollegada) AS tiempollegada, c.cierre_atencion, SEC_TO_TIME(c.tiemporeparacion) AS tiemporeparacion, SEC_TO_TIME(c.tiemporeparacion + c.tiempollegada) AS totalrepar, " + (this.servicio.rVersion().modulos[5] == 1 || this.servicio.rVersion().modulos[10] == 1 ?  "CASE WHEN c.ultimo_rate > 0 THEN (c.tiemporeparacion + c.tiempollegada) / c.ultimo_rate ELSE 0 END, " : "") + "c.inicio_reporte, c.cierre_reporte, c.tiemporeporte, IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS linean, c.linea, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS maquinan, c.maquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS arean, c.area, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS fallan, c.falla_ajustada, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS solici, IFNULL(j.nombre, '" + this.servicio.rTraduccion()[8] + "') AS dpto, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(p.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(m.nombre, '" + this.servicio.rTraduccion()[8] + "') AS confirmador, IFNULL(k.nombre, '" + this.servicio.rTraduccion()[8] + "') AS tmantto, c.detalle, CASE WHEN c.contabilizar = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END AS contab, IFNULL(v.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.contabilizar_fecha, CASE WHEN c.alarmado = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atender = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atendido = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, c.escalado, IFNULL(i.nombre , '" + this.servicio.rTraduccion()[8] + "') AS fallas, c.falla " + (this.servicio.rVersion().modulos[2] == 1 ? ", w.nombre AS herram, w.referencia AS hreferencia, z.p1, z.p2, z.p3, z.p4, z.p5, z.plan, z.fecha, z.responsable, z.departamento, z.mano_de_obra, z.material, z.metodo, z.maquina, z.medio_ambiente, z.comentarios, y.nombre, x.nombre, z.creacion, z.modificacion " : "") + " FROM " + this.servicio.rBD() + ".reportes c LEFT JOIN " + this.servicio.rBD() + ".cat_lineas a ON c.linea = a.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON c.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON c.falla_ajustada = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.solicitante = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON c.tecnico = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON c.tecnicoatend = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas i ON c.falla = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales j ON f.departamento = j.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales k ON c.tipo = k.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos l ON c.turno = l.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios m ON c.confirmado = m.id LEFT JOIN " + this.servicio.rBD() + ".causa_raiz z ON c.id = z.reporte LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios y ON z.creado = y.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios x ON z.modificado = x.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes w ON c.herramental = w.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios v ON c.contabilizar_usuario = v.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios p ON c.tecnico_documento = p.id WHERE c.id = " + this.detalle.id;
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( reporte =>
        {
          doc.addImage(resp[0].logo_ruta, 'PNG', 8, 5, +resp[0].logo_ancho / 5, +resp[0].logo_alto / 5)
          doc.setFontSize(14)
          doc.text(resp[0].planta, 10, 20);
          doc.setFontSize(10)
          const qrcode = document.getElementById('qrcode');
          let imageData= this.getBase64Image(qrcode.firstChild.firstChild);
          doc.addImage(imageData, "JPG", 185, 0, 21, 21);
            
          doc.setLineWidth(0.2); 
          doc.line(10, 22, 210, 22);

          doc.setFontSize(10)
          doc.setFillColor(255,255,200);
          doc.rect(9, 24, 60, 6, 'F')
          doc.text(this.servicio.rTraduccion()[2088] + ": " + this.detalle.id, 10, 28);
          let estReporte = this.servicio.rTraduccion()[160];
          if (+reporte[0].estatusr == 10)
          {
            estReporte =  this.servicio.rTraduccion()[161];
          }
          else if (+reporte[0].estatusr == 100)
          {
            estReporte =  this.servicio.rTraduccion()[162];
          }
          else if (+reporte[0].estatusr == 1000)
          {
            estReporte =  this.servicio.rTraduccion()[163];
          }
          doc.text(this.servicio.rTraduccion()[2090] + ": " + estReporte, 115, 28);
          doc.text(this.servicio.rTraduccion()[2037] + ": " + this.datepipe.transform(reporte[0].fechar, "dd-MMM-yyyy HH:mm:ss"), 10, 33);
          doc.text(this.servicio.rTraduccion()[2038] + ": " + this.datepipe.transform(reporte[0].fecha_reporte, "dd-MMM-yyyy"), 115, 33);
          doc.text(this.servicio.rTraduccion()[2055] + ": " + reporte[0].solici, 10, 38);
          doc.text(this.servicio.rTraduccion()[2056] + ": " + reporte[0].dpto, 115, 38);
          doc.text(this.servicio.rTraduccion()[2060] + ": " + reporte[0].tmantto, 10, 43);
          let nparte = this.servicio.rTraduccion()[8];
          if (reporte[0].herram)
          {
            nparte = reporte[0].herram;
            if (reporte[0].hreferencia)
            {
              nparte = nparte + ' / ' + reporte[0].hreferencia;
            }
          }
          doc.text(this.servicio.rTraduccion()[728] + ": " + nparte, 115, 43);
          doc.line(10, 46, 210, 46);

          doc.text(this.servicio.rTraduccion()[2] + ": " + reporte[0].linean, 10, 51);
          doc.text(this.servicio.rTraduccion()[3] + ": " + reporte[0].maquinan, 115, 51);
          doc.text(this.servicio.rTraduccion()[2051] + ": " + reporte[0].arean, 10, 56);
          doc.text(this.servicio.rTraduccion()[2053] + ": " + reporte[0].fallan, 10, 61);
          doc.line(10, 64, 210, 64);
          doc.text(this.servicio.rTraduccion()[2039] + ": " + this.datepipe.transform(reporte[0].inicio_atencion, "dd-MMM-yyyy HH:mm:ss"), 10, 69);
          doc.text(this.servicio.rTraduccion()[4366] + ": " + reporte[0].tiempollegada, 115, 69);
          doc.text(this.servicio.rTraduccion()[2041] + ": " + this.datepipe.transform(reporte[0].cierre_atencion, "dd-MMM-yyyy HH:mm:ss"), 10, 74);
          doc.text(this.servicio.rTraduccion()[4367] + ": " + reporte[0].tiemporeparacion, 115, 74);
          if (this.servicio.rVersion().modulos[2] == 1)
          {
            doc.text(this.servicio.rTraduccion()[4368] + ": " + reporte[0].totalrepar, 115, 79);
          }
          doc.line(10, 82, 210, 82);
          doc.text(this.servicio.rTraduccion()[2061] + ":", 10, 87);
          let splitTitle = doc.splitTextToSize(reporte[0].detalle, 190);
          let dim = doc.getTextDimensions(splitTitle);
          doc.text(splitTitle, 10, 92);
          let altura = dim.h + 92;
          doc.line(10, altura, 210, altura);
          altura = altura + 5;
          if (reporte[0].confirmador && reporte[0].confirmador != this.servicio.rTraduccion()[8])
          {
            doc.text(this.servicio.rTraduccion()[3385] + ": " + reporte[0].confirmador, 10, altura);
            doc.text(this.servicio.rTraduccion()[4369] + ": " + reporte[0].contab, 115, altura);
          }
          else
          {
            doc.text(this.servicio.rTraduccion()[4369]  + ": " + reporte[0].contab, 10, altura);
          }
          if (this.servicio.rVersion().modulos[2] == 1)
          {
            altura = altura + 3;
            doc.line(10, altura, 210, altura);
            altura = altura + 5;
            doc.text(this.servicio.rTraduccion()[4370], 10, altura);
            altura = altura + 5;            
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2071] + ": " + (reporte[0].p1 ? reporte[0].p1 : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2072] + ": " + (reporte[0].p2 ? reporte[0].p2 : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2073] + ": " + (reporte[0].p3 ? reporte[0].p3 : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2074] + ": " + (reporte[0].p4 ? reporte[0].p4 : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2075] + ": " + (reporte[0].p5 ? reporte[0].p5 : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2076] + ": " + (reporte[0].plan ? reporte[0].plan : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;

            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2077] + ": " + (reporte[0].responsable ? reporte[0].responsable : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            doc.line(10, altura - 2, 210, altura - 2);

            altura = altura + 5;
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2078] + ": " + (reporte[0].mano_de_obra ? reporte[0].mano_de_obra : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2079] + ": " + (reporte[0].material ? reporte[0].material : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2080] + ": " + (reporte[0].metodo ? reporte[0].metodo : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2081] + ": " + (reporte[0].maquina ? reporte[0].maquina : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[2082] + ": " + (reporte[0].medio_ambiente ? reporte[0].medio_ambiente : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            
            splitTitle = doc.splitTextToSize(this.servicio.rTraduccion()[233] + ": " + (reporte[0].comentarios ? reporte[0].comentarios : ""), 190);            
            doc.text(splitTitle, 10, altura);
            dim = doc.getTextDimensions(splitTitle);
            altura = altura + dim.h + 2;
            }
          doc.line(10, altura - 2, 210, altura - 2);
          altura = altura + 3;
          doc.text(this.servicio.rTraduccion()[4371], 10, altura);
          doc.save(this.detalle.id + ".pdf");
        });
      } 
    })
  }
  
  cambiando(evento: any)
  {
    
    if (!this.editando)
    {
      this.cancelarEdicion = false;
      this.faltaMensaje = this.servicio.rTraduccion()[134]
    }
    if (evento.target)
    {
    }
  }

  selectionChange(event){
    console.log('selection changed using keyboard arrow');
  }

  iniLeerBD()
  {
    if (!this.configuracion.visor_revisar_cada)
    {
      this.elTiempo = 5000;
    }
    else
    {
      this.elTiempo = +this.configuracion.visor_revisar_cada * 1000;
    }
    setTimeout(() => {
      this.leerBD();
    }, +this.elTiempo);
  }

  llenarListas(arreglo: number, nTabla: string, cadWhere: string, id: number)
  {
    this.listas = [];
    let sentencia = "SELECT id, nombre FROM " + nTabla + " " + cadWhere + " ORDER BY nombre";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: "0", nombre: this.servicio.rTraduccion()[64]});
      if (arreglo == 1)
      {
        this.listas = resp
        if (resp.length > 1)
        {
          this.detalle.tipo = resp[1].id;  
        }
        else
        {
          this.detalle.tipo = resp[0].id;  
        }
        
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  edicionCancelada()
  {
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "snack-normal";
    mensajeCompleto.mensaje = this.servicio.rTraduccion()[135];
    mensajeCompleto.tiempo = 2000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
  }

  totales()
  {
    let filtroLinea = ""
    if (this.servicio.rUsuario().linea!="S")
    {
      filtroLinea = " linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + this.servicio.rUsuario().id + ") ";
    } 
    let filtroMaquina = ""
    if (this.servicio.rUsuario().maquina!="S")
    {
      filtroMaquina = (filtroLinea ? " AND " : "") + " maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + this.servicio.rUsuario().id + ") ";
    } 
    if (this.servicio.rUsuario().linea!="S" && this.servicio.rUsuario().maquina!="S")
    {
      filtroLinea = " (linea IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + this.servicio.rUsuario().id + ") OR maquina IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 2 AND usuario = " + this.servicio.rUsuario().id + ")) ";
      filtroMaquina = "";
    } 
    let filtroArea = ""
    if (this.servicio.rUsuario().area!="S")
    {
      filtroArea = (filtroLinea || filtroMaquina ? " AND " : "") +  " area IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 3 AND usuario = " + this.servicio.rUsuario().id + ") ";
    }
    let cadFiltro = "";
    if (filtroLinea || filtroMaquina || filtroArea)
    {
      cadFiltro = " WHERE " + filtroLinea +filtroMaquina + filtroArea;
    }
    let sentencia = "SELECT SUM(CASE WHEN estatus <= 100 THEN 1 ELSE 0 END) AS rst, SUM(CASE WHEN estatus = 0 THEN 1 ELSE 0 END) AS rsa, SUM(CASE WHEN alarmado_atender = 'S' AND estatus = 0 THEN 1 ELSE 0 END) AS rsaa, SUM(CASE WHEN estatus = 10 THEN 1 ELSE 0 END) AS rer, SUM(CASE WHEN alarmado_atendido = 'S' AND estatus = 10 THEN 1 ELSE 0 END) AS rera, SUM(CASE WHEN estatus = 100 THEN 1 ELSE 0 END) AS ral, SUM(CASE WHEN alarmado = 'S' AND estatus = 100 THEN 1 ELSE 0 END) AS rala FROM " + this.servicio.rBD() + ".reportes " + cadFiltro;
    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp[0].rsa = !resp[0].rsa ? 0 : resp[0].rsa;
      resp[0].ral = !resp[0].ral ? 0 : resp[0].ral;
      resp[0].rer = !resp[0].rer ? 0 : resp[0].rer;
      resp[0].rst = !resp[0].rst ? 0 : resp[0].rst;
      resp[0].rst = +resp[0].rst > 99 ? "+99" : resp[0].rst;
      resp[0].rsaa = !resp[0].rsaa ? 0 : resp[0].rsaa;
      resp[0].rala = !resp[0].rala ? 0 : resp[0].rala;
      resp[0].rera = !resp[0].rera ? 0 : resp[0].rera;
      resp[0].rsta = !resp[0].rsta ? 0 : resp[0].rsta;
      if (+resp[0].rsa + +resp[0].ral + +resp[0].rer)
      {
        if (this.total.length==0)
        {
          this.total = resp[0];
          this.rsaAlarmado = (+resp[0].rsaa > 0 ? 2 : 0);
          this.rerAlarmado = (+resp[0].rera > 0 ? 2 : 0);
          this.ralAlarmado = (+resp[0].rala > 0 ? 2 : 0);
        }
        else
        { 
          this.total.rst = resp[0].rst;
          if (this.total.rsa != resp[0].rsa || +this.total.rsaa == 0 && +resp[0].rsaa > 0 || +this.total.rsaa > 0 && +resp[0].rsaa == 0)
          {
            this.rsaAlarmado = 1;
            this.total.rsa = resp[0].rsa;
            this.total.rsaa = resp[0].rsaa;
          }
          if (this.total.rer != resp[0].rer || +this.total.rera == 0 && +resp[0].rera > 0 || +this.total.rera > 0 && +resp[0].rera == 0)
          {
            this.rerAlarmado = 1;
            this.total.rer = resp[0].rer;
            this.total.rera = resp[0].rera;
          }
          if (this.total.ral != resp[0].ral || +this.total.rala == 0 && +resp[0].rala > 0 || +this.total.rala > 0 && +resp[0].rala == 0)
          {
            this.ralAlarmado = 1;
            this.total.ral = resp[0].ral;
            this.total.rala = resp[0].rala;
          }
          if (this.rsaAlarmado == 1 || this.rerAlarmado == 1 || this.ralAlarmado == 1)
          {
            setTimeout(() => {
              this.rsaAlarmado = (+resp[0].rsaa > 0 ? 2 : 0);
              this.rerAlarmado = (+resp[0].rera > 0 ? 2 : 0);
              this.ralAlarmado = (+resp[0].rala > 0 ? 2 : 0);
            }, 2000);
          }
        }
      }
      else
      {
        if (+this.total.rsa + +this.total.rer + +this.total.ral == 0 )
        {
          this.rsaAlarmado = (+resp[0].rsaa > 0 ? 2 : 0);
            this.rerAlarmado = (+resp[0].rera > 0 ? 2 : 0);
            this.ralAlarmado = (+resp[0].rala > 0 ? 2 : 0);
        }
        else
        {
          setTimeout(() => {
            this.rsaAlarmado = (+resp[0].rsaa > 0 ? 2 : 0);
            this.rerAlarmado = (+resp[0].rera > 0 ? 2 : 0);
            this.ralAlarmado = (+resp[0].rala > 0 ? 2 : 0);
          }, 2000);
        }
        this.total.rsa = "0";
        this.total.ral = "0"; 
        this.total.rer = "0"; 
        this.total.rst = "0"; 
        this.total.rsaa = "0"; 
        this.total.rala = "0"; 
        this.total.rera = "0";
        this.total.rsta = "0"; 
      }
      
    })
  }

  prevalidar(vez: number)
  {
    //this.registros = [];
    let sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_lineas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 1 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' ORDER BY a.nombre;"
    if (this.servicio.rUsuario().linea=="S")
    {
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_lineas a WHERE a.estatus = 'A' ORDER BY a.nombre;"
    }
    
    if (vez == 2)
    {
      this.todasLasAreas = true;
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, 'S' AS mostrarImagen, area FROM " + this.servicio.rBD() + ".cat_maquinas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 2 AND b.usuario = " + this.servicio.rUsuario().id + " LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id WHERE a.estatus = 'A' AND (a.linea = " + +this.laSeleccion[0] + " OR a.linea = 0) ORDER BY a.nombre;"
      if (this.servicio.rUsuario().maquina=="S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, 'S' AS mostrarImagen, area FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id WHERE a.estatus = 'A' AND (a.linea = " + +this.laSeleccion[0] + " OR a.linea = 0) ORDER BY a.nombre;"
      }      
    }
    else if (vez == 3)
    {
      let cadAdic = "AND (a.id IN (SELECT b.proceso FROM " + this.servicio.rBD() + ".cat_fallas a INNER JOIN " + this.servicio.rBD() + ".relacion_fallas_operaciones b ON a.id = b.falla AND b.tipo = 3 WHERE (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2))) OR (SELECT COUNT(*) FROM " + this.servicio.rBD() + ".cat_fallas a WHERE a.area = 'S' AND (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2))) > 0) "

      let cadAdicNueva = "";
      if (!this.todasLasAreas) 
      {
        cadAdicNueva = " AND " + +this.laSeleccion[1] + " IN (SELECT maquina FROM " + this.servicio.rBD() + ".relacion_areas_maquinas WHERE area = a.id) "
      }

      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S'  AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_areas a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 3 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' " + cadAdicNueva + cadAdic + " ORDER BY a.nombre;"
      if (this.servicio.rUsuario().area=="S")
      {
        sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.imagen, 'S'  AS mostrarImagen FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.estatus = 'A' " + cadAdicNueva + cadAdic + " ORDER BY a.nombre;"
      }
    }
    else if (vez == 4)
    {
      
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS url_mmcall, a.afecta_oee, a.imagen, 'S' AS mostrarImagen, IFNULL(a.ultima_incidencia, '') AS ultima_incidencia, '' AS nmaquina, '' AS narea FROM " + this.servicio.rBD() + ".cat_fallas a WHERE (a.linea = 'S' OR " + +this.laSeleccion[0] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 1)) AND (a.linea = 'S' OR a.maquina = 'S' OR " + +this.laSeleccion[1] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 2)) AND (a.area = 'S' OR " + +this.laSeleccion[2] + " IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_fallas_operaciones WHERE falla = a.id AND tipo = 3)) ORDER BY a.nombre";

    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (vez == 1)
      {
        this.boton01 = true;

        if (resp.length > 1 || resp.length == 0 )
        {
          this.miSeleccion = 1;
          this.laSeleccion[0] = 0;
          this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[2] + "]";
          this.laSeleccion[8] = "";
          
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3] + "]";
          this.laSeleccion[9] = "";

          this.laSeleccion[2] = 0;
          this.laSeleccion[6] = "[" + this.servicio.rTraduccion()[4] + "]";
          this.laSeleccion[10] = "";

          this.laSeleccion[3] = 0;
          this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
          this.laSeleccion[11] = "";
          this.boton02 = false;
          this.boton03 = false;
          this.boton04 = false;
          if (!this.aceptarBoton)
          {
            this.servicio.activarSpinner.emit(false);  
            this.aceptarBoton = true;
          }
          this.parametroVista = 0;  
          this.rRegistros(1);
        }
        else if (resp.length == 1 )
        {
          
          this.laSeleccion[0] = resp[0].id;
          this.laSeleccion[4] = resp[0].nombre;
          this.laSeleccion[8] = resp[0].url_mmcall;
          this.boton02 = true;
          
          setTimeout(() => {
            this.prevalidar(2);  
          }, 100);
        }
        
        
      }
      else if (vez == 2)
      {
        this.boton02 = true;
        this.todasLasAreas = true;
        if (resp.length > 1 || resp.length == 0 )
        {
          this.miSeleccion = 2;
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3] + "]";
          this.laSeleccion[9] = "";
          this.laSeleccion[2] = 0;
          this.laSeleccion[6] = "[" + this.servicio.rTraduccion()[4] + "]";
          this.laSeleccion[10] = "";
          this.laSeleccion[3] = 0;
          this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
          this.laSeleccion[11] = "";
          
          this.boton04 = false;
          this.boton03 = false;
          if (!this.aceptarBoton)
          {
            this.servicio.activarSpinner.emit(false);  
            this.aceptarBoton = true;
          }
          this.parametroVista = 0;
          this.rRegistros(2);
        }
        else if (resp.length == 1 )
        {
          this.laSeleccion[1] = resp[0].id;
          this.laSeleccion[5] = resp[0].nombre;
          this.laSeleccion[9] = resp[0].url_mmcall;
          this.todasLasAreas = resp[0].area == 'S';
          this.boton03 = true;
          
          setTimeout(() => {
            this.prevalidar(3);  
          }, 100);
        }
      }
      else if (vez == 3)
      {
        this.boton03 = true;

        if (resp.length > 1 || resp.length == 0)
          {
          this.miSeleccion = 3;
          this.laSeleccion[3] = 0;
          this.laSeleccion[8] = "[" + this.servicio.rTraduccion()[5] + "]";
          this.laSeleccion[11] = "";
          this.boton04 = false;
          if (!this.aceptarBoton)
          {
            this.servicio.activarSpinner.emit(false);  
            this.aceptarBoton = true;
          }
          this.parametroVista = 0;
          this.rRegistros(3);
        }
        else if (resp.length == 1 )
        {
          this.laSeleccion[2] = resp[0].id;
          this.laSeleccion[6] = resp[0].nombre;
          this.laSeleccion[10] = resp[0].url_mmcall;
          this.miSeleccion = 4
          this.boton04 = true;
          this.parametroVista = 0;
          setTimeout(() => {
            this.rRegistros(4);
          }, 100);  
        }
      }
      else if (vez == 4)
      {
        this.boton04 = true;
        this.parametroVista = 0;
        this.miSeleccion = vez;
        this.rRegistros(this.miSeleccion);
      }
    })
  }

  generarClave()
  {
    if (!this.local)
    {
      this.clavePublica = "";
      return;
    }
    else if (this.local == "")
    {
      this.clavePublica = "";
      return;
    }

    this.clavePublica = "";
    this.claveInterna = this.servicio.alterarPalabraClave();
    let temporal = "";
    let temporal2 = "";
    let numero = "";
    let numero2 = 0;
    let buscarEn = 0;
    let posicion = 0;
    let numeroActual = 0;
    let recorrido = 0;
    if (this.claveInterna.length > this.local.length)
    
    {
      temporal = "";
      temporal2 = this.claveInterna;
      
      do
      {
        if (recorrido >= this.clave.length)
        {
          recorrido = 0;
        }
        numero = this.local[recorrido % this.local.length].charCodeAt(0).toString();
        numero2 = +this.clave[recorrido];

        if (numero.length == 1)
        {
          buscarEn = +numero;
          numeroActual = 0;  
        }
        else if (numero.length == 2)
        {
          let numero1 = +numero.substr(0, 1);
          let numero2 = +numero.substr(1);  
          if (numeroActual == 0)
          {
            buscarEn = numero1;
            numeroActual = 1;  
          }
          else
          {
            buscarEn = numero2;
            numeroActual = 0;  
          }
          posicion = numero1 + numero2 + recorrido;
        }
        else if (numero.length == 3)
        {
          let numero1 = +numero.substr(0, 1);
          let numero2 = +numero.substr(1, 1);  
          let numero3 = +numero.substr(2);  
          if (numeroActual == 0)
          {
            buscarEn = numero1;
            numeroActual = 1;  
          }
          else if (numeroActual == 1)
          {
            buscarEn = numero2;
            numeroActual = 2;  
          }
          else 
          {
            buscarEn = numero3;
            numeroActual = 0;  
          }
          posicion = numero1 + numero2 + numero3 + recorrido;
        }
        posicion = posicion + numero2;
        if (posicion > this.clave.length - 1)
        {
          posicion = posicion % this.clave.length
        }
        temporal = (temporal. length == 0 ? this.tipo : "") + temporal + this.clave[posicion];  
        recorrido = recorrido + 1;
      }
      while (temporal.length < this.claveInterna.length)
      temporal = temporal.substr(0, this.claveInterna.length);
    }
    else if (this.claveInterna.length == this.local.length)
    {
      temporal = this.local;
      temporal2 = this.claveInterna;
    }
    
    else if (this.local.length > this.claveInterna.length)
    {
      temporal = this.local;
      temporal2 = this.claveInterna;
      do
      {
        temporal2 = temporal2 + this.claveInterna;  
      }
      while (temporal2.length < this.local.length)
      temporal2 = temporal2.substr(0, this.local.length);
    }
    let cadComparar = "";
    for (var i = 0; i < temporal.length; i++) 
      {
        let numero = (temporal[i].charCodeAt(0) ^ temporal2[i].charCodeAt(0)).toString();
        if (numero. length == 1)
        {
          cadComparar = numero;
        }
        else if (numero.length == 2)
        {
          cadComparar = numero.substr(1);
        }
        else if (numero.length == 3)
        {
          cadComparar = numero.substr(1, 1);
        }
        this.clavePublica = this.clavePublica + cadComparar; 
      }
  }

  finalizaLlamada()
  {
    if (this.noLicenciados > 0)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "450px", panelClass:  'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[136], mensaje: this.servicio.rTraduccion()[137].replace("campo_0", this.tEnviados).replace("campo_1", this.noLicenciados), alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
      });
      respuesta.afterClosed().subscribe(result => 
      {
      }) 
    }
  }

  listarAreas()
  {
    let sentencia = "SELECT a.id, a.nombre FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.estatus = 'A' ORDER BY a.nombre;"
    this.areas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      resp.splice(0, 0, {id: "0", nombre: this.servicio.rTraduccion()[64]});
      this.areas = resp;
    });
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
      this.partesF = [];
      this.detalle.herramental = -1;
      this.servicio.activarSpinnerSmall.emit(true);
      if (miCad) 
      {
        for (var i = 0; i < this.herramentales.length; i  ++)
        {
          if (this.herramentales[i].nombre)
          {
            if (this.herramentales[i].nombre.toLowerCase().indexOf(miCad.toLowerCase()) !== -1)
            {
              this.partesF.splice(this.partesF.length, 0, this.herramentales[i]);
            }
          }
        }
      }
      else
      {
        this.partesF = this.herramentales;
      }
      this.servicio.activarSpinnerSmall.emit(false);
    }
    else if (indice==2)
    {
      let miCad = "";
      if (evento)
      {
        if (evento.target)
        {
          miCad = evento.target.value;
        }
        else
        {
          miCad = evento;
        }
      }
      else
      {
        miCad = evento;
      }
      if (this.cadenaAntes != miCad )
      {
        this.cadenaAntes = miCad;
        setTimeout(() => {
          this.filtrando(2, this.cadenaAntes);
        }, 300);
        return;
      }
      this.fallasF = [];
      this.detalle.falla_ajustada = -1;
      this.servicio.activarSpinnerSmall.emit(true);
      if (miCad) 
      {
        for (var i = 0; i < this.fallas.length; i  ++)
        {
          if (this.fallas[i].nombre)
          {
            if (this.fallas[i].nombre.toLowerCase().indexOf(miCad.toLowerCase()) !== -1)
            {
              this.fallasF.splice(this.partesF.length, 0, this.fallas[i]);
            }
          }
        }
      }
      else
      {
        this.fallasF = this.fallas;
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
          this.detalle.parte = this.servicio.rTraduccion()[64];
          this.detalle.herramental = 0;
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
          this.detalle.parte = this.servicio.rTraduccion()[64];
          this.detalle.herramental = 0;
          return;
        }
      }
      //Buscar parte
      this.servicio.activarSpinnerSmall.emit(true);
      let sentencia = "SELECT id, CASE WHEN ISNULL(referencia) THEN nombre ELSE CONCAT(nombre, '" + this.servicio.rTraduccion()[2637] + "', referencia, ')') END AS nombre FROM " + this.servicio.rBD() + ".cat_partes WHERE id = " + idBuscar;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.detalle.parte = resp[0].nombre; 
          this.partesF = resp;
          this.detalle.herramental = resp[0].id;
        }
        setTimeout(() => {
          this.servicio.activarSpinnerSmall.emit(false);
        }, 100);
      })
    }
    else if (indice == 2)
    {
      let idBuscar: number;
      if (evento.option)
      {
        if (+evento.option.value == 0)
        {
          this.detalle.fallaD = "";
          this.detalle.falla_ajustada = 0;
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
          this.detalle.fallaD = "";
          this.detalle.falla_ajustada = 0;
          return;
        }
      }
      //Buscar falla
      this.servicio.activarSpinnerSmall.emit(true);
      let sentencia = "SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_fallas WHERE id = " + idBuscar;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.detalle.fallaD = resp[0].nombre; 
          this.fallasF = resp;
          this.detalle.falla_ajustada = resp[0].id;
        }
        setTimeout(() => {
          this.servicio.activarSpinnerSmall.emit(false);
        }, 100);
      })
    }
  }

  accion(id: number)
  {
    this.servicio.cambioOpcion.emit(11);
  }

  foco(e: any, origen: number)
  {
    if (origen == 1)
    {
      if (this.detalle.fallaD == 0 && this.fallasF.length == 0 && this.fallas.length > 0)
      {
        this.filtrando(2, "")
      }
      e.stopPropagation();
      this.listaFallas.openPanel();  
    }
  }
}


