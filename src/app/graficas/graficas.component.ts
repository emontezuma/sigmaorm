import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ViewportRuler } from "@angular/cdk/overlay";
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { Router } from '@angular/router';
import { DxChartComponent } from "devextreme-angular";
import { DatePipe } from '@angular/common'
import { DateAdapter } from '@angular/material/core';



@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrls: ['./graficas.component.css'],
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
    trigger('esquema_grafica', [
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
        style({ opacity: 0.3, transform: 'translateY(5px)' }),
        animate('0.25s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.25s', style({ opacity: 0, transform: 'translateY(5px)' }))
      ])
    ]),
    trigger('esquema_top', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(-15px)' }),
        animate('0.2s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.2s', style({ opacity: 0, transform: 'translateY(-15px)' }))
      ])
    ]),
    trigger('esquema_left', [
      transition(':enter', [
        style({ opacity: 0.3 }),
        animate('0.1s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.1s', style({ opacity: 0.3 }))
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
  ]),],
  
})

export class GraficasComponent implements OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("txtNombre", { static: false }) txtNombre: ElementRef;
  @ViewChild("txtDesde", { static: false }) txtDesde: ElementRef;
  @ViewChild("txtHasta", { static: false }) txtHasta: ElementRef;
  @ViewChild(DxChartComponent, { static: false }) chart: DxChartComponent;
  @ViewChild("listaLineas", { static: false }) listaLineas: MatSelectionList;
  @ViewChild("listaMaquinas", { static: false }) listaMaquinas: MatSelectionList;
  @ViewChild("listaAreas", { static: false }) listaAreas: MatSelectionList;
  @ViewChild("listaResponsables", { static: false }) listaResponsables: MatSelectionList;
  @ViewChild("listaFallas", { static: false }) listaFallas: MatSelectionList;
  @ViewChild("listaTecnicos", { static: false }) listaTecnicos: MatSelectionList;
  @ViewChild("listaPartes", { static: false }) listaPartes: MatSelectionList;
  @ViewChild("listaTurnos", { static: false }) listaTurnos: MatSelectionList;
  @ViewChild("listaLotes", { static: false }) listaLotes: MatSelectionList;
  @ViewChild("listaParos", { static: false }) listaParos: MatSelectionList;
  @ViewChild("listaListad", { static: false }) listaListad: MatSelectionList;
  @ViewChild("listaClases", { static: false }) listaClases: MatSelectionList;

  
  scrollingSubscription: Subscription;
  vistaCatalogo: Subscription;
  //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";  
  URL_FOLDER = "/sigma/assets/datos/";  

  constructor
  (
    private _adapter: DateAdapter<any>,
    public servicio: ServicioService,
    private route: ActivatedRoute,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private router: Router, 
    public datepipe: DatePipe,
    private viewportRuler: ViewportRuler,
    
  ) {
    this.calcularColor = this.calcularColor.bind(this); 
    this.emit00 = this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      if (pantalla)
      {
        setTimeout(() => {
          this.altoGrafica = this.servicio.rPantalla().alto - 156 - (this.verTop ? 94 : 0);
          this.anchoGrafica = this.servicio.rPantalla().ancho - this.servicio.rAnchoSN() - 80;  
        }, 100);
      }
      else
      {
        this.altoGrafica = this.servicio.rPantalla().alto - 156 - (this.verTop ? 94 : 0);
        this.anchoGrafica = this.servicio.rPantalla().ancho - this.servicio.rAnchoSN() - 80;  
      }
    });

    this.emit10 = this.servicio.cambioColor.subscribe((estatus: any)=>
    {
      if (this.router.url.substr(0, 9) == "/graficas")
      {
        
        this.colorear();

      }
      
    });
   
    this.emit20 = this.servicio.mensajeError.subscribe((mensaje: any)=>
    {
      let mensajes = mensaje.split(";");
      if (mensajes[0] == 1)
      {
        this.pantalla = 1;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2007]);
        this.errorMensaje = mensajes[1];
      }
    });

   
    this.emit30 = this.servicio.cambioIdioma.subscribe((data: boolean)=>
    {
      if (this.router.url.substr(0, 9) == "/graficas")
      {
        if (this.graficando)
        {
          this.modelo = 11;
          this.filtrando = false;
          this.formateando = false;
          this.selTipoGrafico(this.grActual);
        }
        
      }
      
    })

    this.emit40 = this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      
      //this.reajustarPantalla();
    });
    this.emit50 = this.servicio.esMovil.subscribe((accion: boolean)=>
    {
      this.movil = accion;
    });
    this.emit60 = this.servicio.vista.subscribe((accion: number)=>
    {
      if (accion >= 1000 && accion <= 2000)
      {
        this.modelo = 11;
        this.graficando = true;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2173]);
        this.filtrando = false;
        this.formateando = false;
        this.servicio.mostrarBmenu.emit(this.verTop ? 1 : 2);
        this.altoGrafica = this.servicio.rPantalla().alto - 156 - (this.verTop ? 94 : 0);
        this.anchoGrafica = this.servicio.rPantalla().ancho - this.servicio.rAnchoSN() - 80;
        this.grActual = +this.servicio.rUsuario().preferencias_andon.substr(41, 1);
        if (accion==1010)
        {
          this.grActual = 1;
        }
        else if (accion==1020)
        {
          this.grActual = 2;
        }
        else if (accion==1030)
        {
          this.grActual = 3;
        }
        else if (accion==1040)
        {
          this.grActual = 4;
        }
        else if (accion==1050)
        {
          this.grActual = 5;
        }
        else if (accion==1060)
        {
          this.grActual = 6;
        }
        else if (accion==1070)
        {
          this.grActual = 7;
        }
        else if (accion==1080)
        {
          this.grActual = 8;
        }
        this.selTipoGrafico(this.grActual)
        this.iniLeerBD()
      }
    });
    this.emit70 = this.servicio.mostrarBarra.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 9) == "/graficas")
      {
        this.verTop = accion;
        if (!this.verTop)
        {
          setTimeout(() => {
            this.altoGrafica = this.servicio.rPantalla().alto - 156 ;  
          }, 200);
          
        }
        else
        {
          this.altoGrafica = this.servicio.rPantalla().alto - 250;
        }
        
        this.servicio.guardarVista(41, this.verTop ? 1: 0 );
      }
    });
    this.emit80 = this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    let accion = this.servicio.rVista();
    if (accion==1010)
    {
      this.grActual = 1;
    }
    else if (accion==1020)
    {
      this.grActual = 2;
    }
    else if (accion==1030)
    {
      this.grActual = 3;
    }
    else if (accion==1040)
    {
      this.grActual = 4;
    }
    else if (accion==1050)
    {
      this.grActual = 5;
    }
    else if (accion==1060)
    {
      this.grActual = 6;
    }
    else if (accion==1070)
    {
      this.grActual = 7;
    }
    else if (accion==1080)
    {
      this.grActual = 8;
    }
    this.rConfiguracion();
    this.primeraVez = true;
    this.selTipoGrafico(this.grActual);
  }

  ngOnInit() {
    this.servicio.validarLicencia(1)
        this.servicio.mostrarBmenu.emit(this.verTop ? 1 : 2);
    this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2173]);
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
  emit100: Subscription;

  variable: string = "mttr";
  variable_literal: string = this.servicio.rTraduccion()[2679];
  variable_2: string = "mttrc";

  variable_o: string = "impacto";
  idGrafico: number = 0;

  variableftq: string = "";
  variableftq_literal: string = "";
  variableftq_2: string = "";
  
  variabledis: string = "";
  variabledis_literal: string = "";
  variabledis_2: string = "";
  cadTextoY: string = "";
  actualIndice: number = 0;
  
  variableoee: string = "";
  variableoee_literal: string = "";
  variableoee_2: string = "";
  
  variableefi: string = "";
  variableefi_literal: string = "";
  variableefi_2: string = "";
  
  cadSQLActual: string = "";
  consultaTemp: string = "0";
  consultaBuscada: boolean = false;
  
  modelo: number  = 0;
  offSet: number;
  verIrArriba: boolean = false;
  yaAgrupado: boolean = false;
  filtrarC: boolean = false;
  hayFiltro: boolean = false
  eliminar: boolean = false;
  editando: boolean = false;
  graficando: boolean = true;
  texto_boton: string = "#" + this.servicio.rColores().texto_boton;
  verBuscar: boolean = true;
  verTabla: boolean = false;
  cambioVista: boolean = true;
  movil: boolean = false;
  verGrafico: boolean = false;
  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  error04: boolean = false;
  primeraVez: boolean = false;
  nCatalogo: string = this.servicio.rTraduccion()[1189]
  verBarra: string = "";
  nGrafica: string = "";
  ultimoReporte: string = "";
  nombreFile: string = "";
  ultimoID: number = 0;
  copiandoDesde: number = 0;
  textoBuscar: string = "";
  miGrafica: any = [];
  miGraficaTotal: any = [];
  miGraficaSF: any = [];
  tecnicos: any = [];
  partes: any = [];
  turnos: any = [];
  procesos: any = [];
  lotes: any = [];
  paros: any = [];
  consultas: any = [];
  maquinas: any = [];
  parGrafica: any = [];
  graficaActual: number = 1;
  agrupacion: any;
  titulosGrupos: any;
  agrupandoGrafica: number = 0;
  resumenes: any = [];
  sub_titulo: string = "";
  formatoGrafico: any = {tipo: "fixedPoint", precision: 0};
  

  coloresArreglo = [ "#F2D7D5", "#D7BDE2", "#AED6F1", "#D5F5E3 ", "#F0B27A", "#F1948A", "#FAD7A0", "#D5DBDB", "#AEB6BF", "#45B39D", "#884EA0", "#D4AC0D", "#3498DB", "#ABB2B9", "#E74C3C", "#D4E6F1", "#FEF5E7", "#A9DFBF", "#C39BD3", "#FFAB91", "#99A3A4", "#ABEBC6", "#A569BD"]

  ///


  verTop: boolean = this.servicio.rUsuario().preferencias_andon.substr(40, 1) == "1";
  
  ultimaActualizacion = new Date();
  altoGrafica: number = this.servicio.rPantalla().alto - 156 - (this.verTop ? 94 : 0);
  anchoGrafica: number = this.servicio.rPantalla().ancho - this.servicio.rAnchoSN() - 80;
  errorTitulo: string = "[" + this.servicio.rTraduccion()[6] + "]";
  errorMensaje: string = "";
  pantalla: number = 2;  
  miSeleccion: number = 1;
  iconoGeneral: string = "";
  icono_grafica: string = "";
  iconoVista: string = "";
  literalVista: string = this.servicio.rTraduccion()[1191];
  tituloBuscar: string = "";
  alarmados: number = 0;
  elTiempo: number = 0;
  despuesBusqueda: number = 0;
  enCadaSegundo: boolean = false;
  botElim: boolean = false;
  botGuar: boolean = false;
  botCan: boolean = false;
  contarTiempo: boolean = false;
  visualizarImagen: boolean = false;
  sondeo: number = 0;
  registros: any = [];
  opciones: any = [];
  arrFiltrado: any = [];
  detalle: any = [];
  titulos: any = [];
  ayudas: any = [];
  cronometro: any;
  leeBD: any;
  nombreReporte: string = this.servicio.rTraduccion()[2742];
  tituloReporte: string = this.servicio.rTraduccion()[2743];
  laSeleccion: any = [];
  configuracion: any = [];
  fallas: any = [];
  lineas: any = [];
  areas: any = [];
  responsables: any = [];
  arreHover: any = [];
  notas: string = "";
  hoverp01: boolean = false;
  hoverp02: boolean = false;
  noLeer: boolean = false;
  operacioSel: boolean = false;
  maquinaSel: boolean = false;
  reparandoSel: boolean = false;
  abiertoSel: boolean = false;
  lineaSel: boolean = false;
  filtrando: boolean = false;
  formateando: boolean = false;
  faltaMensaje: string = "";
  responsableSel: boolean = false;
  fallaSel: boolean = false;
  rAlarmado: string = "N";
  horaReporte;
  mensajePadre: string = "";
  filtroReportes: string = "";
  filtroKanban: string = "";
  filtroParos: string = "";
  filtroRechazos: string = "";
  
  filtroMTBF: string = "";
  filtroKRS: string = "";
  filtroK: string = "";
  filtroMTBF_are: string = "";
  filtroMTBF_fal: string = "";
  filtroMTBF_tec: string = "";
  filtroOEE: string = "";
  filtroOEEDias: string = "";
  filtroCorte: string = "";
  fDesde: string = "";
  fHasta: string = "";
  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";
  mostrarDetalle: boolean = false;
  grActual: number = 1; //+this.servicio.rUsuario().preferencias_andon.substr(41, 1);

  ayuda01 = this.servicio.rTraduccion()[2680]
  ayuda02 = this.servicio.rTraduccion()[2681]
  ayuda03 = this.servicio.rTraduccion()[2682]
  ayuda04 = this.servicio.rTraduccion()[2683]
  ayuda20 = ""
  

  botonera1: number = 1;
  boton01: boolean = true;
  boton02: boolean = true;
  boton03: boolean = true;
  boton04: boolean = true;

  bot1: boolean = true;
  bot2: boolean = true;
  bot3: boolean = true;
  bot4: boolean = true;
  bot5: boolean = true;
  bot6: boolean = true;
  bot7: boolean = true;

  guardarSel: boolean = true;
  bot1Sel: boolean = false;
  bot2Sel: boolean = false;
  bot3Sel: boolean = false;
  bot4Sel: boolean = false;
  bot5Sel: boolean = false;
  bot6Sel: boolean = false;
  bot7Sel: boolean = false;
  bot8Sel: boolean = false;

  maxmin: {startValue: number, endValue: number};
  maxmin_o: {startValue: number, endValue: number};

  boton11: boolean = true;
  boton12: boolean = true;
  boton13: boolean = false;

  animando: boolean = true;
  listoMostrar: boolean = true;

  literalSingular: string = "";
  literalSingularArticulo: string = "";
  literalPlural: string = "";

  ayuda11: string = "[" + this.servicio.rTraduccion()[7] + "]"

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


  salidaEfecto(evento: any)
  {
    if (evento.toState)
    {
      this.modelo = this.modelo > 10 ? (this.modelo - 10) : this.modelo;
    }
  }

  
  exportar()
  {
    let resp = [];
    if (this.miGrafica.length > 0)
    {
      if (this.grActual <= 2)
      {
        if (this.graficaActual == 1)
        {
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[558], b: this.servicio.rTraduccion()[2047], c: this.servicio.rTraduccion()[2685], d: this.servicio.rTraduccion()[2684], e: this.servicio.rTraduccion()[2112], f: this.servicio.rTraduccion()[2672], g: this.servicio.rTraduccion()[2687], h: this.servicio.rTraduccion()[2688], i: this.servicio.rTraduccion()[2679], j: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual <= 4)
        {
          let titulo = this.graficaActual == 2 ? this.servicio.rTraduccion()[2049] : this.graficaActual == 3 ? this.servicio.rTraduccion()[4] : this.servicio.rTraduccion()[5]; 
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[558], b: titulo, c: this.servicio.rTraduccion()[2684], d: this.servicio.rTraduccion()[2112], e: this.servicio.rTraduccion()[2686], f: this.servicio.rTraduccion()[2687], g: this.servicio.rTraduccion()[2688], h: this.servicio.rTraduccion()[2673], i: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual <= 9)
        {
          let titulo = this.servicio.rTraduccion()[2697]
          let tittotal = this.servicio.rTraduccion()[2699]
          if (this.graficaActual == 5)
          {
            titulo = this.servicio.rTraduccion()[2695]
          }
          else if (this.graficaActual == 6)
          {
            titulo = this.servicio.rTraduccion()[2696]
          }
          else if (this.graficaActual == 7)
          {
            titulo = this.servicio.rTraduccion()[2693]
          }
          else if (this.graficaActual == 8)
          {
            titulo = this.servicio.rTraduccion()[2694]
            tittotal = this.servicio.rTraduccion()[2698]
          }
          else if (this.graficaActual == 9)
          {
            titulo = this.servicio.rTraduccion()[2694]
            tittotal = this.servicio.rTraduccion()[2698]
          }
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[558], b: titulo, c: tittotal, d: this.servicio.rTraduccion()[2684], e: this.servicio.rTraduccion()[2112], f: this.servicio.rTraduccion()[2686], g: this.servicio.rTraduccion()[2687], h: this.servicio.rTraduccion()[2688], i: this.servicio.rTraduccion()[2679], j: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual == 10)
        {
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[584], b: this.servicio.rTraduccion()[2112], c: this.servicio.rTraduccion()[2686], d: this.servicio.rTraduccion()[2687], e: this.servicio.rTraduccion()[2688], f: this.servicio.rTraduccion()[2679], g: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual == 11)
        {
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[2690], b: this.servicio.rTraduccion()[2691], c: this.servicio.rTraduccion()[2684], d: this.servicio.rTraduccion()[2112], e: this.servicio.rTraduccion()[2686], f: this.servicio.rTraduccion()[2687], g: this.servicio.rTraduccion()[2688], h: this.servicio.rTraduccion()[2679], i: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual == 12)
        {
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a: this.servicio.rTraduccion()[2692], c: this.servicio.rTraduccion()[2684], d: this.servicio.rTraduccion()[2112], e: this.servicio.rTraduccion()[2686], f: this.servicio.rTraduccion()[2687], g: this.servicio.rTraduccion()[2688], h: this.servicio.rTraduccion()[2679], i: this.servicio.rTraduccion()[3784] })
        }
        else if (this.graficaActual == 13)
        {
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {a:this.servicio.rTraduccion()[558], b: this.servicio.rTraduccion()[1399], c: this.servicio.rTraduccion()[2684], d: this.servicio.rTraduccion()[2112], e: this.servicio.rTraduccion()[2686], f: this.servicio.rTraduccion()[2687], g: this.servicio.rTraduccion()[2688], h: this.servicio.rTraduccion()[2679], i: this.servicio.rTraduccion()[3784] })
        }
      }
      else if (this.grActual==4)
      {
        if (this.graficaActual == 1)
        {
          resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2744], referencia: this.servicio.rTraduccion()[2745], linea: this.servicio.rTraduccion()[2048], tmaquinas: this.servicio.rTraduccion()[2746], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
          for (var i = 0; i < this.miGraficaTotal.length; i++)
          {
            resp.splice(i + 1, 0, {nombre: this.miGraficaTotal[i].nombre, referencia: this.miGraficaTotal[i].referencia, linea: this.miGraficaTotal[i].linea, tmaquinas: this.miGraficaTotal[i].tmaquinas, paros_m: this.miGraficaTotal[i].paros_m, produccion_m: this.miGraficaTotal[i].produccion_m, piezas_m: this.miGraficaTotal[i].piezas_m, calidad_m: this.miGraficaTotal[i].calidad_m, rechazos_m: this.miGraficaTotal[i].rechazos_m, disponible_m: this.miGraficaTotal[i].disponible_m, ftq: this.miGraficaTotal[i].ftq, efi: this.miGraficaTotal[i].efi, dis: this.miGraficaTotal[i].dis, oee: this.miGraficaTotal[i].oee })
          }
        }
        else if (this.graficaActual == 2)
        {
          resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2753], referencia: this.servicio.rTraduccion()[698], id: this.servicio.rTraduccion()[2050], nlinea: this.servicio.rTraduccion()[2754], linea: this.servicio.rTraduccion()[2755], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
          for (var i = 0; i < this.miGraficaTotal.length; i++)
          {
            resp.splice(i + 1, 0, {nombre: this.miGraficaTotal[i].nombre, referencia: this.miGraficaTotal[i].referencia, id: this.miGraficaTotal[i].id, nlinea: this.miGraficaTotal[i].nlinea, linea: this.miGraficaTotal[i].linea, paros_m: this.miGraficaTotal[i].paros_m, produccion_m: this.miGraficaTotal[i].produccion_m, piezas_m: this.miGraficaTotal[i].piezas_m, calidad_m: this.miGraficaTotal[i].calidad_m, rechazos_m: this.miGraficaTotal[i].rechazos_m, disponible_m: this.miGraficaTotal[i].disponible_m, ftq: this.miGraficaTotal[i].ftq, efi: this.miGraficaTotal[i].efi, dis: this.miGraficaTotal[i].dis, oee: this.miGraficaTotal[i].oee })
          }
        }
        else if (this.graficaActual >= 3 && this.graficaActual <= 5)
        {
          let cad1 = this.servicio.rTraduccion()[2697]
          let cad2 = this.servicio.rTraduccion()[2787]
          if (this.graficaActual == 4)
          {
            cad1 = this.servicio.rTraduccion()[2700]
            cad2 = this.servicio.rTraduccion()[2786]
              
          }
          else if (this.graficaActual == 5)
          {
            cad1 = this.servicio.rTraduccion()[2788]
            cad2 = this.servicio.rTraduccion()[2789]
          }
          resp.splice(i, 0, {nombre: cad1, linea: cad2, tmaquinas: this.servicio.rTraduccion()[2746], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
          for (var i = 0; i < this.miGraficaTotal.length; i++)
          {
            resp.splice(i + 1, 0, {nombre: this.miGraficaTotal[i].nombre, linea: this.miGraficaTotal[i].linea, tmaquinas: this.miGraficaTotal[i].tmaquinas, paros_m: this.miGraficaTotal[i].paros_m, produccion_m: this.miGraficaTotal[i].produccion_m, piezas_m: this.miGraficaTotal[i].piezas_m, calidad_m: this.miGraficaTotal[i].calidad_m, rechazos_m: this.miGraficaTotal[i].rechazos_m, disponible_m: this.miGraficaTotal[i].disponible_m, ftq: this.miGraficaTotal[i].ftq, efi: this.miGraficaTotal[i].efi, dis: this.miGraficaTotal[i].dis, oee: this.miGraficaTotal[i].oee })
          }
        }
        else if (this.graficaActual >= 6 && this.graficaActual <= 8)
        {
          let cad1 = this.servicio.rTraduccion()[1397]
          if (this.graficaActual == 7)
          {
            cad1 = this.servicio.rTraduccion()[2741]
          }
          else if (this.graficaActual == 8)
          {
            cad1 = this.servicio.rTraduccion()[2692]
          }
          if (this.graficaActual == 7)
          {
            resp.splice(i, 0, {nombre: cad1, dia_inicial: this.servicio.rTraduccion()[2756], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
            for (var i = 0; i < this.miGraficaTotal.length; i++)
            {
              resp.splice(i + 1, 0, {nombre: this.miGraficaTotal[i].nombre, inicio: this.miGraficaTotal[i].inicio, paros_m: this.miGraficaTotal[i].paros_m, produccion_m: this.miGraficaTotal[i].produccion_m, piezas_m: this.miGraficaTotal[i].piezas_m, calidad_m: this.miGraficaTotal[i].calidad_m, rechazos_m: this.miGraficaTotal[i].rechazos_m, disponible_m: this.miGraficaTotal[i].disponible_m, ftq: this.miGraficaTotal[i].ftq, efi: this.miGraficaTotal[i].efi, dis: this.miGraficaTotal[i].dis, oee: this.miGraficaTotal[i].oee })
            }  
          }
          else
          {
            resp.splice(i, 0, {nombre: cad1, paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
            for (var i = 0; i < this.miGraficaTotal.length; i++)
            {
              resp.splice(i + 1, 0, {nombre: this.miGraficaTotal[i].nombre, paros_m: this.miGraficaTotal[i].paros_m, produccion_m: this.miGraficaTotal[i].produccion_m, piezas_m: this.miGraficaTotal[i].piezas_m, calidad_m: this.miGraficaTotal[i].calidad_m, rechazos_m: this.miGraficaTotal[i].rechazos_m, disponible_m: this.miGraficaTotal[i].disponible_m, ftq: this.miGraficaTotal[i].ftq, efi: this.miGraficaTotal[i].efi, dis: this.miGraficaTotal[i].dis, oee: this.miGraficaTotal[i].oee })
            } 
          }
        }
        
      }
      else if (this.grActual==7)
      {
        let descripcion  = ""
        if (this.graficaActual <= 3)
        {
          resp = this.miGraficaTotal.slice(); 
          
          if (this.graficaActual == 1)
          {
            descripcion = this.servicio.rTraduccion()[3986];
          }
          else if (this.graficaActual == 2)
          {
            descripcion = this.servicio.rTraduccion()[572];
          }
          else if (this.graficaActual == 3)
          {
            descripcion = this.servicio.rTraduccion()[4268];
          }
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {nombre: descripcion, id: this.servicio.rTraduccion()[558], docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });
        }
        else if (this.graficaActual > 3)
        {
          if (this.graficaActual == 4)
          {
            descripcion = this.servicio.rTraduccion()[3312];
          }
          else if (this.graficaActual == 5)
          {
            descripcion = this.servicio.rTraduccion()[2690];
          }
          else if (this.graficaActual == 6)
          {
            descripcion = this.servicio.rTraduccion()[2777];
          }
          resp = this.miGraficaTotal.slice(); 
          resp.splice(i, 0, {nombre: descripcion, docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });
        }
      }
      else if (this.grActual==8)
      {
        let descripcion  = ""
        if (this.graficaActual <= 5)
        {
          resp = this.miGraficaTotal.slice(); 
          
          if (this.graficaActual == 1)
          {
            descripcion = this.servicio.rTraduccion()[3986];
          }
          else if (this.graficaActual == 2)
          {
            descripcion = this.servicio.rTraduccion()[572];
          }
          else if (this.graficaActual == 3)
          {
            descripcion = this.servicio.rTraduccion()[4268];
          }
          else if (this.graficaActual == 4)
          {
            descripcion = this.servicio.rTraduccion()[4044];
          }
          else if (this.graficaActual == 5)
          {
            descripcion = this.servicio.rTraduccion()[728];
          }
          resp = this.miGraficaTotal.slice(); 
          if (this.graficaActual < 5)
          {
            resp.splice(i, 0, {nombre: descripcion, id: this.servicio.rTraduccion()[558], docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else 
          {
            resp.splice(i, 0, {nombre: descripcion, referencia: this.servicio.rTraduccion()[698], id: this.servicio.rTraduccion()[558], docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });
          }
        }
        else if (this.graficaActual > 5)
        {
          if (this.graficaActual == 6)
          {
            descripcion = this.servicio.rTraduccion()[3312];
          }
          else if (this.graficaActual == 7)
          {
            descripcion = this.servicio.rTraduccion()[2690];
          }
          else if (this.graficaActual == 8)
          {
            descripcion = this.servicio.rTraduccion()[2777];
          }
          resp = this.miGraficaTotal.slice(); 

          if (this.graficaActual == 7)
          {
            resp.splice(i, 0, {nombre: descripcion, referencia: this.servicio.rTraduccion()[2691], docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });  
          }
          else
          {
            resp.splice(i, 0, {nombre: descripcion, docs: this.servicio.rTraduccion()[4317], nega: this.servicio.rTraduccion()[4319], posi: this.servicio.rTraduccion()[4320], positivos: this.servicio.rTraduccion()[4316], tiempo: this.servicio.rTraduccion()[4318], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          
        }
        
        
      }
      else
      {
        if (this.grActual==3)
        {
          if (this.graficaActual == 1)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2744], referencia: this.servicio.rTraduccion()[2745], id: this.servicio.rTraduccion()[2048], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 2)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2753], referencia: this.servicio.rTraduccion()[2760], id: this.servicio.rTraduccion()[2050], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 3)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2761], referencia: this.servicio.rTraduccion()[2762], id: this.servicio.rTraduccion()[2052], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 4)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[1533], referencia: this.servicio.rTraduccion()[2763], id: this.servicio.rTraduccion()[2764], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 5)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2765], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[2766], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 6)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2767], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[2768], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 7)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2769], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[2770], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 8)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2771], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[2772], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 9)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2773], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[2774], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 10)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2775], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 11)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2690], referencia: this.servicio.rTraduccion()[2776], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 12)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2777], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 13)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[1399], referencia: this.servicio.rTraduccion()[698], id: this.servicio.rTraduccion()[2778], docs: this.servicio.rTraduccion()[2757], tiempo: this.servicio.rTraduccion()[2758], loca: this.servicio.rTraduccion()[3530], repa: this.servicio.rTraduccion()[3531], porcentaje: this.servicio.rTraduccion()[2759] });
          }
        }
        else if (this.grActual==5)
        {
          if (this.graficaActual == 1)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2744], referencia: this.servicio.rTraduccion()[2745], id: this.servicio.rTraduccion()[2048], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 2)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2753], referencia: this.servicio.rTraduccion()[2760], id: this.servicio.rTraduccion()[2050], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 3)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2780], referencia: this.servicio.rTraduccion()[2781], id: this.servicio.rTraduccion()[2782], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 4)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2783], referencia: this.servicio.rTraduccion()[2781], id: this.servicio.rTraduccion()[2782], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 5)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2775], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 6)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2690], referencia: this.servicio.rTraduccion()[2776], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 7)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2777], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2779], tiempo: this.servicio.rTraduccion()[2758], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          
        }
        else if (this.grActual==6)
        {
          if (this.graficaActual == 1)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2744], referencia: this.servicio.rTraduccion()[2745], id: this.servicio.rTraduccion()[2048], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 2)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2753], referencia: this.servicio.rTraduccion()[2760], id: this.servicio.rTraduccion()[2050], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 3)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2780], referencia: this.servicio.rTraduccion()[2781], id: this.servicio.rTraduccion()[2782], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 4)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2783], referencia: this.servicio.rTraduccion()[2781], id: this.servicio.rTraduccion()[2782], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 5)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2775], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 6)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2690], referencia: this.servicio.rTraduccion()[2776], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          else if (this.graficaActual == 7)
          {
            resp = this.miGraficaTotal.slice(); 
            resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2777], referencia: this.servicio.rTraduccion()[8], id: this.servicio.rTraduccion()[8], docs: this.servicio.rTraduccion()[2750], tiempo: this.servicio.rTraduccion()[2784], porcentaje: this.servicio.rTraduccion()[2759] });
          }
          
        }
        else if (this.graficaActual == 2)
        {
          resp.splice(i, 0, {nombre: this.servicio.rTraduccion()[2753], referencia: this.servicio.rTraduccion()[698], id: this.servicio.rTraduccion()[2050], nlinea: this.servicio.rTraduccion()[2754], linea: this.servicio.rTraduccion()[2755], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
          for (var i = 0; i < this.miGraficaSF.length; i++)
          {
            resp.splice(i + 1, 0, {nombre: this.miGraficaSF[i].nombre, referencia: this.miGraficaSF[i].referencia, id: this.miGraficaSF[i].id, nlinea: this.miGraficaSF[i].nlinea, linea: this.miGraficaSF[i].linea, paros_m: this.miGraficaSF[i].paros_m, produccion_m: this.miGraficaSF[i].produccion_m, piezas_m: this.miGraficaSF[i].piezas_m, calidad_m: this.miGraficaSF[i].calidad_m, rechazos_m: this.miGraficaSF[i].rechazos_m, disponible_m: this.miGraficaSF[i].disponible_m, ftq: this.miGraficaSF[i].ftq, efi: this.miGraficaSF[i].efi, dis: this.miGraficaSF[i].dis, oee: this.miGraficaSF[i].oee })
          }
        }

        else if (this.graficaActual >= 3 && this.graficaActual <= 5)
        {
          let cad1 = this.servicio.rTraduccion()[2697]
          let cad2 = this.servicio.rTraduccion()[2787]
          if (this.graficaActual == 4)
          {
            cad1 = this.servicio.rTraduccion()[2700]
            cad2 = this.servicio.rTraduccion()[2786]
              
          }
          else if (this.graficaActual == 5)
          {
            cad1 = this.servicio.rTraduccion()[2788]
            cad2 = this.servicio.rTraduccion()[2789]
          }
          resp.splice(i, 0, {nombre: cad1, linea: cad2, tmaquinas: this.servicio.rTraduccion()[2746], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
          for (var i = 0; i < this.miGraficaSF.length; i++)
          {
            resp.splice(i + 1, 0, {nombre: this.miGraficaSF[i].nombre, linea: this.miGraficaSF[i].linea, tmaquinas: this.miGraficaSF[i].tmaquinas, paros_m: this.miGraficaSF[i].paros_m, produccion_m: this.miGraficaSF[i].produccion_m, piezas_m: this.miGraficaSF[i].piezas_m, calidad_m: this.miGraficaSF[i].calidad_m, rechazos_m: this.miGraficaSF[i].rechazos_m, disponible_m: this.miGraficaSF[i].disponible_m, ftq: this.miGraficaSF[i].ftq, efi: this.miGraficaSF[i].efi, dis: this.miGraficaSF[i].dis, oee: this.miGraficaSF[i].oee })
          }
        }
        else if (this.graficaActual >= 6 && this.graficaActual <= 8)
        {
          let cad1 = this.servicio.rTraduccion()[1397]
          if (this.graficaActual == 7)
          {
            cad1 = this.servicio.rTraduccion()[2741]
          }
          else if (this.graficaActual == 8)
          {
            cad1 = this.servicio.rTraduccion()[2692]
          }
          if (this.graficaActual == 7)
          {
            resp.splice(i, 0, {nombre: cad1, dia_inicial: this.servicio.rTraduccion()[2756], paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
            for (var i = 0; i < this.miGraficaSF.length; i++)
            {
              resp.splice(i + 1, 0, {nombre: this.miGraficaSF[i].nombre, inicio: this.miGraficaSF[i].inicio, paros_m: this.miGraficaSF[i].paros_m, produccion_m: this.miGraficaSF[i].produccion_m, piezas_m: this.miGraficaSF[i].piezas_m, calidad_m: this.miGraficaSF[i].calidad_m, rechazos_m: this.miGraficaSF[i].rechazos_m, disponible_m: this.miGraficaSF[i].disponible_m, ftq: this.miGraficaSF[i].ftq, efi: this.miGraficaSF[i].efi, dis: this.miGraficaSF[i].dis, oee: this.miGraficaSF[i].oee })
            }  
          }
          else
          {
            resp.splice(i, 0, {nombre: cad1, paros_m: this.servicio.rTraduccion()[2111], produccion_m: this.servicio.rTraduccion()[2747], piezas_m: this.servicio.rTraduccion()[2748], calidad_m: this.servicio.rTraduccion()[2749], rechazos_m: this.servicio.rTraduccion()[2750], disponible_m: this.servicio.rTraduccion()[2112], ftq: this.servicio.rTraduccion()[2751], efi: this.servicio.rTraduccion()[2752], dis: this.servicio.rTraduccion()[577], oee: this.servicio.rTraduccion()[536] });
            for (var i = 0; i < this.miGraficaSF.length; i++)
            {
              resp.splice(i + 1, 0, {nombre: this.miGraficaSF[i].nombre, paros_m: this.miGraficaSF[i].paros_m, produccion_m: this.miGraficaSF[i].produccion_m, piezas_m: this.miGraficaSF[i].piezas_m, calidad_m: this.miGraficaSF[i].calidad_m, rechazos_m: this.miGraficaSF[i].rechazos_m, disponible_m: this.miGraficaSF[i].disponible_m, ftq: this.miGraficaSF[i].ftq, efi: this.miGraficaSF[i].efi, dis: this.miGraficaSF[i].dis, oee: this.miGraficaSF[i].oee })
            } 
          }
        }
      }
    }
    this. servicio.generarReporte(resp, this.tituloReporte, this.nombreReporte + ".csv", "")
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
  
  rConfiguracion()
  {
    this.configuracion = [];
    this.servicio.consultasBD({accion: 100, sentencia: "/configuracion/10"}).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.configuracion = resp[0]; 
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  buscarPeriodo(periodo: string, indice: number)
  {
    let fDesde = this.fDesde;
    let fHasta = this.fHasta;
    let desde = new Date();
    let hasta = new Date();
    let grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : this.servicio.rTraduccion()[438]
    if (periodo == "2")
    {
      let nuevaFecha = this.servicio.fecha(1, '' , "yyyy") + "/01/01";         
      desde = new Date(nuevaFecha);
      grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : ("YtD(" + this.datepipe.transform(desde, "yyyy") + ")");
    }
    else if (periodo == "3")
    {
      let nuevaFecha = this.servicio.fecha(1, '' , "yyyy/MM") + "/01";         
      desde = new Date(nuevaFecha);
      grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : ("MtD(" + this.datepipe.transform(desde, "yyyy/MM") + ")");
    }
    else if (periodo == "4")
    {
      let mesTemp = new Date(this.datepipe.transform(new Date(desde), "yyyy") + "/01/01");
      mesTemp.setDate(mesTemp.getDate() - 1);
      desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/01/01");
      hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/12/31");
      grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : this.datepipe.transform(hasta, "yyyy");
    }
    else if (periodo == "5")
    {
      let mesTemp = new Date(this.datepipe.transform(new Date(desde), "yyyy/MM") + "/01");
      mesTemp.setDate(mesTemp.getDate() - 1);
      desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM") + "/01");
      hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM/dd"));
      grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : this.datepipe.transform(hasta, "yyyy/MM");
    }
    else if (periodo == "6")
    {
      let mesTemp = new Date(this.datepipe.transform(new Date(desde), "yyyy/MM") + "/01");
      mesTemp.setMonth(mesTemp.getMonth() - 12);

      let mesTemp2 = new Date(this.datepipe.transform(new Date(desde), "yyyy/MM") + "/01");
      mesTemp2.setMonth(mesTemp2.getMonth() - 11);
      mesTemp2.setDate(mesTemp2.getDate() - 1);

      desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM") + "/01");
      hasta = new Date(this.datepipe.transform(new Date(mesTemp2), "yyyy/MM/dd"));
      grupo = this.titulosGrupos[indice] ? this.titulosGrupos[indice] : this.datepipe.transform(hasta, "yyyy/MM");
    }
    if (periodo > "1")
    {
      fHasta = this.datepipe.transform(hasta, "yyyy/MM/dd");
      fDesde = this.datepipe.transform(desde, "yyyy/MM/dd");  
      
    }
    
    let sentencia = "";
    if (this.grActual<= 2)
    {
      sentencia = "SELECT 0 AS linea, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF : ""));
      
      if (this.graficaActual == 2)
      {
        sentencia = "SELECT 0 AS id, '" + grupo + "' AS nombre, e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY linea, maquina) AS c ON a.id = c.maquina, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF : ""));;
      }
      else if (this.graficaActual == 3)
      {
        sentencia = "SELECT 0 AS id, '" + grupo + "' AS nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_areas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT AREA, linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY AREA, linea, maquina) AS c ON a.id = c.AREA, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF_are : "")) ;
      }
      else if (this.graficaActual == 4)
      {
        sentencia = "SELECT 0 AS id, '" + grupo + "' AS nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY falla_ajustada, linea, maquina) AS c ON a.id = c.falla_ajustada, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF_fal : ""));
      }
      else if (this.graficaActual == 5)
      {
        sentencia = "SELECT 0 AS tipo, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.tipo = b.id AND b.tabla = 50, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF : ""));
      }
      else if (this.graficaActual == 6)
      {
        sentencia = "SELECT 0 AS agrupador_1, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 20, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF : ""));
      }
      else if (this.graficaActual == 7)
      {
        sentencia = "SELECT 0 AS agrupador_2, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 25, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF : ""));
      }
      else if (this.graficaActual == 8)
      {
        sentencia = "SELECT 0 AS agrupador_1, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY falla_ajustada, maquina, linea) AS c ON a.id = c.falla_ajustada LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 40, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF_fal : ""));
      }
      else if (this.graficaActual == 9)
      {
        sentencia = "SELECT 0 AS agrupador_2, '" + grupo + "' AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY falla_ajustada, maquina, linea) AS c ON a.id = c.falla_ajustada LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 45, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF_fal : ""));
      }
      else if (this.graficaActual == 10)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0) AS tdisponible, (IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ";
      }
      else if (this.graficaActual == 11)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(a.fecha,'%x/%v'), ' Monday'), '%x/%v %W') AS inicio, COUNT(*), SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) AS tdisponible, (SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ;";
      }
      else if (this.graficaActual == 12)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, COUNT(*), SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) AS tdisponible, (SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ;";
      }
      else if (this.graficaActual == 13)
      {
        sentencia = "SELECT 0 AS id, '" + grupo + "' AS nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc, 0 AS pareto FROM " + this.servicio.rBD() + ".cat_usuarios a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT tecnicoatend, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + fDesde + "' AND c.fecha_reporte <= '" + fHasta + "' " + (periodo != "1" ? this.filtroReportes : "") + " GROUP BY tecnicoatend, maquina) AS c ON a.id = c.tecnicoatend, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + fDesde + "' AND fecha <= '" + fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + (periodo != "1" ? this.filtroMTBF_tec : ""));
      }
    }
    else if (this.grActual == 4)
    {
      sentencia = "SELECT '" + grupo + "' AS nombre, 0 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "' " + (periodo != "1" ? this.filtroCorte : "") + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + (periodo != "1" ? this.filtroOEE : "");
      if (this.graficaActual == 2)
      {
        sentencia = "SELECT 0 AS id, '" + grupo + "' AS nombre, '' AS referencia, 0 AS tmaquinas, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, a.linea, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "' " + (periodo != "1" ? this.filtroCorte : "") + " GROUP BY j.id) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + (periodo != "1" ? this.filtroOEE : "");
      }
      else if (this.graficaActual == 3)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, 0 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.tipo = b.id AND b.tabla = 50 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "' " + (periodo != "1" ? this.filtroCorte : "") + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + (periodo != "1" ? this.filtroOEE : "");
      }
      else if (this.graficaActual == 4)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, 0 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 20 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "' " + (periodo != "1" ? this.filtroCorte : "") + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + (periodo != "1" ? this.filtroOEE : "");
      }
      else if (this.graficaActual == 5)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, 0 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 25 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "' " + (periodo != "1" ? this.filtroCorte : "") + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + (periodo != "1" ? this.filtroOEE : "");
      }
      else if (this.graficaActual == 6)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + (periodo != "1" ? this.filtroOEEDias : "") + " WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' ";
      }
      else if (this.graficaActual == 7)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, '' AS inicio, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + (periodo != "1" ? this.filtroOEEDias : "") + " WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' ";
      }
      else if (this.graficaActual == 8)
      {
        sentencia = "SELECT '" + grupo + "' AS nombre, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + fDesde + "' AND dia <= '" + fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + fDesde + "' AND dia <= '" + fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + (periodo != "1" ? this.filtroOEEDias : "") + " WHERE i.dia >= '" + fDesde + "' AND i.dia <= '" + fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + fDesde + "' AND a.fecha <= '" + fHasta + "' ";
      }
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.resumenes.splice(indice, 0, resp[0]);
      this.agregados(indice + 1)
    });

  }

  
  leerBD()
  {
    
    if (this.noLeer || this.router.url.substr(0, 9) != "/graficas")
    {
      return;
    }
    let campos = {accion: 100, sentencia: this.cadSQLActual};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.arrFiltrado = resp;
      let arreTemp: any = this.arrFiltrado;
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
            for (var j = arreTemp.length - 1; j >= 0 ; j--)
            {
              if (this.registros[i].id ==  arreTemp[j].id)
              {
                if (this.registros[i].estatus !=  arreTemp[j].estatus || this.registros[i].nombre !=  arreTemp[j].nombre )
                {
                  this.registros[i].estatus = arreTemp[j].estatus;
                  this.registros[i].nombre = arreTemp[j].nombre;
                }
                if (this.miSeleccion == 2)
                {
                  if (this.registros[i].nlinea !=  arreTemp[j].nlinea)
                  {
                    this.registros[i].nlinea = arreTemp[j].nlinea;
                  }
                }
                hallado = true;
                break;
              }
            }
            if (!hallado)
            {
              this.registros.splice(i, 1);
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
              this.sondeo = arreTemp[i].id;
            }
          }
        }
      }
    });
    clearTimeout(this.leeBD);
    if (this.router.url.substr(0, 9) == "/graficas")
    {
      this.leeBD = setTimeout(() => {
        this.leerBD()
      },  +this.elTiempo);
    }
  }

  selectionChange(event){
    console.log('selection changed using keyboard arrow');
  }

  iniLeerBD()
  {
    if (!this.servicio.rConfig().visor_revisar_cada)
    {
      this.elTiempo = 5000;
    }
    else
    {
      this.elTiempo = +this.servicio.rConfig().visor_revisar_cada * 1000;
    }
    setTimeout(() => {
      this.leerBD();
    }, +this.elTiempo);
  }

  //Desde aqui
  selTipoGrafico(id: number)
  {
    this.grActual = id;
    this.servicio.guardarVista(42, id);
    let sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 100 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico < 200 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + " ORDER BY a.grafico;";
    if (this.grActual == 1)
    {
      this.icono_grafica = "i_tiemporeparacion";
      this.opciones = [];
      //this.opciones = [{id: 1, nombre: "MTTR por Linea"}, {id: 2, nombre: "MTTR por Máquina"}, {id: 3, nombre: "MTTR por Área"},  {id: 4, nombre: "MTTR por Falla"}, {id: 5, nombre: "MTTR por Tipo/máquina"}, {id: 6, nombre: "MTTR por Grupo 1/Máquina"}, {id: 7, nombre: "MTTR por Grupo 2/Máquina"}, {id: 8, nombre: "MTTR por Grupo 1/Falla"}, {id: 9, nombre: "MTTR por Grupo 2/Falla"}, {id: 10, nombre: "MTTR por Día"}, {id: 11, nombre: "MTTR por Semana"}, {id: 12, nombre: "MTTR por Mes"}, {id: 13, nombre: "MTTR por Técnico"}];
    }
    else if (this.grActual == 2)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 200 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 200 AND a.grafico < 300 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_tiempofallas";
      //this.opciones = [{id: 1, nombre: "MTBF por Linea"}, {id: 2, nombre: "MTBF por Máquina"}, {id: 3, nombre: "MTBF por Área"},  {id: 4, nombre: "MTBF por Falla"}, {id: 5, nombre: "MTBF por Tipo/máquina"}, {id: 6, nombre: "MTBF por Grupo 1/Máquina"}, {id: 7, nombre: "MTBF por Grupo 2/Máquina"}, {id: 8, nombre: "MTBF por Grupo 1/Falla"}, {id: 9, nombre: "MTBF por Grupo 2/Falla"}, {id: 10, nombre: "MTBF por Día"}, {id: 11, nombre: "MTBF por Semana"}, {id: 12, nombre: "MTBF por Mes"}, {id: 13, nombre: "MTBF por Técnico"}];
    }
    else if (this.grActual == 3)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 300 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 300 AND a.grafico < 400 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_pareto";
      //this.opciones = [{id: 1, nombre: "Pareto por Linea"}, {id: 2, nombre: "Pareto por Máquina"}, {id: 3, nombre: "Pareto por Área"},  {id: 4, nombre: "Pareto por Falla"}, {id: 5, nombre: "Pareto por Tipo/máquina"}, {id: 6, nombre: "Pareto por Grupo 1/Máquina"}, {id: 7, nombre: "Pareto por Grupo 2/Máquina"}, {id: 8, nombre: "Pareto por Grupo 1/Falla"}, {id: 9, nombre: "Pareto por Grupo 2/Falla"}, {id: 10, nombre: "Pareto por Día"}, {id: 11, nombre: "Pareto por Semana"}, {id: 12, nombre: "Pareto por Mes"}, {id: 13, nombre: "Pareto por Técnico"}];
    }
    else if (this.grActual == 4)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 400 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 400 AND a.grafico < 500 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_oee";
    }
    else if (this.grActual == 5)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 500 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 500 AND a.grafico < 600 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_oee";
    }
    else if (this.grActual == 6)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 600 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 600 AND a.grafico < 700 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_oee";
    }
    else if (this.grActual == 7)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 700 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 700 AND a.grafico < 800 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_kanban_i";
    }
    else if (this.grActual == 8)
    {
      sentencia = "SELECT IFNULL(b.id, a.id) AS id, IFNULL(b.titulo, a.titulo) AS nombre, a.grafico - 800 AS nro, IFNULL(b.visualizar, a.visualizar) AS visualizar FROM " + this.servicio.rBD() + ".pu_graficos a LEFT JOIN " + this.servicio.rBD() + ".pu_graficos b ON a.grafico = b.grafico AND b.usuario = " + this.servicio.rUsuario().id + " AND b.idioma = " + this.servicio.rIdioma().id + " WHERE a.grafico >= 800 AND a.grafico < 900 AND a.usuario = 0 AND a.activo = 'S' AND a.idioma = " + this.servicio.rIdioma().id + "  ORDER BY a.grafico;";
    
      this.opciones = [];
      this.icono_grafica = "i_kanban_i";
    }
    //Se busca la consulta

    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.opciones = resp;
      this.aplicarConsulta(-1)
    });
    
  }

  opcionGrafica()
  {
    if (this.modelo != 0)
    {
      //this.modelo = 11;
    }
    
    let prefijo = this.servicio.rTraduccion()[2704]
    this.nombreReporte = this.servicio.rTraduccion()[2704]
    this.tituloReporte = this.servicio.rTraduccion()[2703]
    
    if (this.grActual == 2)
    {
      prefijo = this.servicio.rTraduccion()[2702]
      this.nombreReporte = this.servicio.rTraduccion()[2702]
      this.tituloReporte = this.servicio.rTraduccion()[2701]
    }
    else if (this.grActual == 3 || this.grActual >= 5 && this.grActual < 7)
    {
      prefijo = this.servicio.rTraduccion()[2708]
      this.nombreReporte = this.servicio.rTraduccion()[2708]
      this.tituloReporte = this.servicio.rTraduccion()[2707]
    }
    else if (this.grActual == 4)
    {
      prefijo = this.servicio.rTraduccion()[2706]
      this.nombreReporte = this.servicio.rTraduccion()[2706]
      this.tituloReporte = this.servicio.rTraduccion()[2705]
    }
    if (this.grActual >= 7)
    {
      if (this.grActual == 7)
      {
        prefijo = this.servicio.rTraduccion()[4337]
        this.nombreReporte = this.servicio.rTraduccion()[4337]
        this.tituloReporte = this.servicio.rTraduccion()[4338]
      }
      else
      {
        prefijo = this.servicio.rTraduccion()[4321]
        this.nombreReporte = this.servicio.rTraduccion()[4321]
        this.tituloReporte = this.servicio.rTraduccion()[4316]        
      }
      if (this.graficaActual == 1)
      {
        prefijo = prefijo + this.servicio.rTraduccion()[4322]
        this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4322]
        this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4313]
      }
      else if (this.graficaActual == 2)
      {
        prefijo = prefijo + this.servicio.rTraduccion()[4323]
        this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4323]
        this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4324]
      }
      else if (this.graficaActual == 3)
      {
        prefijo = prefijo + this.servicio.rTraduccion()[4325]
        this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4325]
        this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4326]
      }
      if (this.grActual == 7 )
      {
        if (this.graficaActual == 4)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4327]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4327]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4328]
        }
        else if (this.graficaActual == 5)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4329]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4329]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4330]
        }
        else if (this.graficaActual == 6)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4331]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4331]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4332]
        }
        else if (this.graficaActual == 7)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4333]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4333]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4334]
        }
        else if (this.graficaActual == 8)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4335]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4335]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4336]
        }
      }
      else
      {
        if (this.graficaActual == 4)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4331]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4331]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4332]
        }
        else if (this.graficaActual == 5)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4333]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4333]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4334]
        }
        else if (this.graficaActual == 6)
        {
          prefijo = prefijo + this.servicio.rTraduccion()[4335]
          this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[4335]
          this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[4336]
        }
      }
      
    }
    
    else if (this.graficaActual == 1)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2731]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2731]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2716]
    }
    else if (this.graficaActual == 2)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2746]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2732]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2717]
    }
    else if (this.graficaActual == 3 && (this.grActual < 4 || this.grActual >= 5))
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2723]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2723]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2713]
    }
    else if (this.graficaActual == 3 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2738]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2738]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2722]
    }
    else if (this.graficaActual == 4 && this.grActual < 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2725]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2725]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2715]
    }
    else if (this.graficaActual == 4 && this.grActual >= 5)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2739]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2739]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2721]
    }
    else if (this.graficaActual == 4 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2727]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2727]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2711]
    }
    else if (this.graficaActual == 5 && this.grActual < 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2740]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2740]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2722]
    }
    else if (this.graficaActual == 5 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2730]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2730]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2712]
    }
    else if (this.graficaActual == 5 && this.grActual >= 5)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2724]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2724]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2714]
    }
    else if (this.graficaActual == 6 && this.grActual < 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2727]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2727]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2711]
    }
    else if (this.graficaActual == 6 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2724]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2724]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2714]
    }
    else if (this.graficaActual == 6 && this.grActual >= 5)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2736]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2736]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2719]
    }
    else if (this.graficaActual == 7 && this.grActual < 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2729]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2729]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2712]
    }
    else if (this.graficaActual == 7 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2736]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2736]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2719]
    }
    else if (this.graficaActual == 7 && this.grActual >= 5)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2733]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2733]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2718]
    }
    else if (this.graficaActual == 8 && this.grActual < 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2726]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2726]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2709]
    }
    else if (this.graficaActual == 8 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2733]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2733]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2718]
    }
    else if (this.graficaActual == 9 && this.grActual == 4)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2734]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2734]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2735]
    }
    else if (this.graficaActual == 9)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2728]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2728]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2710]
    }
    else if (this.graficaActual == 10)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2724]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2724]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2714]
    }
    else if (this.graficaActual == 11)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2736]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2736]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2719]
    }
    else if (this.graficaActual == 12)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2733]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2733]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2718]
    }
    else if (this.graficaActual == 13)
    {
      prefijo = prefijo + this.servicio.rTraduccion()[2737]
      this.nombreReporte = this.nombreReporte + this.servicio.rTraduccion()[2737]
      this.tituloReporte = this.tituloReporte + this.servicio.rTraduccion()[2720]
    }
    
    this.nombreFile = prefijo;
  }

  preGraficar(id: number)
  {
    this.servicio.activarSpinner.emit(true);
    this.modelo = 11;
    this.miGrafica = [];
    this.parGrafica = [];
    let grafica = 0;
    if (this.primeraVez)
    {
      for (i = 0; i < this.opciones.length; i++)
      {
        if (this.opciones[i].visualizar=="S")
        {
          grafica = this.opciones[i].id;
          this.graficaActual = i + 1;
          break;
        }
      }
      this.primeraVez = false;
    }
    else if (id == -10)
    {
      for (var i = this.graficaActual - 2; i >= 0; i--)
      {
        if (this.opciones[i].visualizar=="S")
        {
          grafica = this.opciones[i].id;
          this.graficaActual = i + 1;
          break;
        }
      }
      if (grafica == 0)
      {
        for (i = this.opciones.length - 1; i >= 0; i--)
        {
          if (this.opciones[i].visualizar=="S")
          {
            grafica = this.opciones[i].id;
            this.graficaActual = i + 1;
            break;
          }
        } 
      }
    }
    else if (id == -5 || id == 0)
    {
      for (i = (id == 0 ? 0 : this.graficaActual); i < this.opciones.length; i++)
      {
        if (this.opciones[i].visualizar=="S" || id == 0)
        {
          grafica = this.opciones[i].id;
          this.graficaActual = i + 1;
          break;
        }
      }
      if (grafica == 0)
      {
        for (i = 0; i < this.opciones.length; i++)
        {
          if (this.opciones[i].visualizar=="S")
          {
            grafica = this.opciones[i].id;
            this.graficaActual = i + 1;
            break;
          }
        } 
      }
    }
    else 
    {
      if (id >= this.opciones.length)
      {
        id = 0;
      }
      grafica = this.opciones[id].id
      this.graficaActual = id + 1;
    }
    this.opcionGrafica()
    this.yaAgrupado = false;
    this.graficar(grafica);  
      
  }

  colorear()
  {
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".pu_graficos WHERE id = " + this.idGrafico +  ";";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {

      resp[0].tipo_valor = resp[0].tipo_principal == "B" ? "bar" : resp[0].tipo_principal == "L" ? "spline" : "area";
      resp[0].tipo_valorFTQ = resp[0].oee_tipo[0] == "B" ? "bar" : resp[0].oee_tipo[0] == "L" ? "spline" : "area";
      resp[0].tipo_valorEFI = resp[0].oee_tipo[1] == "B" ? "bar" : resp[0].oee_tipo[1] == "L" ? "spline" : "area";
      resp[0].tipo_valorDIS = resp[0].oee_tipo[2] == "B" ? "bar" : resp[0].oee_tipo[2] == "L" ? "spline" : "area";
      resp[0].oee_colores = resp[0].oee_colores ? resp[0].oee_colores : ";;";
      
      let oee_colores = resp[0].oee_colores.split(";");
      resp[0].colorFTQ = oee_colores[0] ? ("#" + oee_colores[0]) : "";
      resp[0].colorEFI = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].colorDIS = oee_colores[2] ? ("#" + oee_colores[2]) : "";  


      resp[0].oee_tipoFTQ = resp[0].oee_tipo[0];
      resp[0].oee_tipoEFI = resp[0].oee_tipo[1];
      resp[0].oee_tipoDIS = resp[0].oee_tipo[2];

      resp[0].oee_selFTQ = resp[0].oee[0] == "S";
      resp[0].oee_selEFI = resp[0].oee[1] == "S";
      resp[0].oee_selDIS = resp[0].oee[2] == "S";

      
      resp[0].oee_etiFTQ = resp[0].oee[3];
      resp[0].oee_etiEFI = resp[0].oee[4];
      resp[0].oee_etiDIS = resp[0].oee[5];



      resp[0].oee_nombre = resp[0].oee_nombre ? resp[0].oee_nombre : ";;";
      oee_colores = resp[0].oee_nombre.split(";");
      resp[0].oee_nombreFTQ = oee_colores[0];
      resp[0].oee_nombreEFI = oee_colores[1];
      resp[0].oee_nombreDIS = oee_colores[2];

      oee_colores = resp[0].textos_adicionales.split(";");
      resp[0].adic21 = oee_colores[0];
      resp[0].adic22 = oee_colores[1];

      resp[0].esperado_esquema =!resp[0].esperado_esquema ? ";;" : resp[0].esperado_esquema;
      oee_colores = resp[0].esperado_esquema.split(";");
      resp[0].dividir_colores = oee_colores[0] ? oee_colores[0] : "N";
      resp[0].color_bajo = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].color_alto = oee_colores[2] ? ("#" + oee_colores[2]) : "";  
      
      resp[0].adicionales_colores = resp[0].adicionales_colores ? resp[0].adicionales_colores : ";;;;;";
      oee_colores = resp[0].adicionales_colores.split(";");
      resp[0].coladic1 = oee_colores[0] ? ("#" + oee_colores[0]) : "";
      resp[0].coladic2 = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].coladic3 = oee_colores[2] ? ("#" + oee_colores[2]) : "";    
      resp[0].coladic4 = oee_colores[3] ? ("#" + oee_colores[3]) : "";    
      resp[0].coladic5 = oee_colores[4] ? ("#" + oee_colores[4]) : "";    
      resp[0].coladic6 = oee_colores[5] ? ("#" + oee_colores[5]) : "";    
      
      if (!resp[0].sub_titulo || resp[0].sub_titulo == "")
      {
        resp[0].sub_titulo = this.sub_titulo;
      }
      
      this.parGrafica = resp[0];
      let cadTextoY = "";
      if (this.parGrafica.texto_y)
      { 
        cadTextoY = this.parGrafica.texto_y.split(";");
      }
      this.actualIndice = +this.parGrafica.orden;
      this.detalle.texto_y2 = cadTextoY[+this.actualIndice];
      this.parGrafica.overlap = (this.parGrafica.overlap == "R" ? "rotate" : "stagger");
      this.parGrafica.color_barra = (!this.parGrafica.color_barra ? "" : "#" + this.parGrafica.color_barra);
      this.parGrafica.etiqueta_color = (!this.parGrafica.etiqueta_color ? "" : "#" + this.parGrafica.etiqueta_color);
      this.parGrafica.etiqueta_fondo = (!this.parGrafica.etiqueta_fondo ? "" : "#" + this.parGrafica.etiqueta_fondo);
      this.parGrafica.etiqueta_formato = !this.parGrafica.etiqueta_formato ? 0 : this.parGrafica.etiqueta_formato;
      this.parGrafica.color_fondo = (!this.parGrafica.color_fondo ? "" : "#" + this.parGrafica.color_fondo);
      this.parGrafica.color_fondo_barras = (!this.parGrafica.color_fondo_barras ? "" : "#" + this.parGrafica.color_fondo_barras);
      this.parGrafica.color_letras = (!this.parGrafica.color_letras ? "" : "#" + this.parGrafica.color_letras);
      this.parGrafica.color_leyenda = (!this.parGrafica.color_leyenda ? "" : "#" + this.parGrafica.color_leyenda);
      this.parGrafica.color_leyenda_fondo = (!this.parGrafica.color_leyenda_fondo ? "" : "#" + this.parGrafica.color_leyenda_fondo);
      this.parGrafica.color_spiline = (!this.parGrafica.color_spiline ? "" : "#" + this.parGrafica.color_spiline);
      this.parGrafica.grueso_spiline = (this.parGrafica.grueso_spiline == "0" ? "1" : this.parGrafica.grueso_spiline);

    

    if (this.parGrafica.color_barra.length == 0)
    {
      this.parGrafica.color_barra = "#" + this.servicio.rColores().texto_boton; 
      this.parGrafica.color_barra_borde = "#" + this.servicio.rColores().borde_boton; 
    }

    if (this.parGrafica.color_spiline.length == 0)
    {
      this.parGrafica.color_spiline = "#" + this.servicio.rColores().texto_boton; 
    }

    if (this.parGrafica.etiqueta_color.length == 0)
    {
      this.parGrafica.etiqueta_color = "#" + this.servicio.rColores().texto_boton; 
      this.parGrafica.etiqueta_fondo = "#" + this.servicio.rColores().fondo_boton; 
    }
    if (this.parGrafica.color_fondo.length == 0)
    {
      this.parGrafica.color_fondo = "#" + this.servicio.rColores().fondo_tarjeta; 
    }
    if (this.parGrafica.color_fondo_barras.length == 0)
    {
      this.parGrafica.color_fondo_barras = "transparent";
    }

    if (this.parGrafica.color_letras.length == 0)
    {
      this.parGrafica.color_letras = "#" + this.servicio.rColores().texto_tarjeta; 
    }
    if (this.parGrafica.color_leyenda.length == 0)
    {
      this.parGrafica.color_leyenda = "#" + this.servicio.rColores().texto_boton;
    }
    if (this.parGrafica.color_leyenda_fondo.length == 0)
    {
      this.parGrafica.color_leyenda_fondo = "#" + this.servicio.rColores().fondo_boton;;
    }
  })
  }

  agregados(indice)
  {
    if (indice == 6)
    {
      this.yaAgrupado = true;
      this.graficar(this.agrupandoGrafica);
    }
    else if (this.agrupacion[indice] != 0)
    {
      this.buscarPeriodo(this.agrupacion[indice], indice)
    }
    else
    {
      this.agregados(indice + 1);
    }
    
  }
  
  graficar(id: number)
  { 
    this.servicio.activarSpinnerSmall.emit(true);
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".pu_graficos WHERE id = " + id;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {

      if (resp.length == 0)
      {
        this.servicio.activarSpinnerSmall.emit(false);
        this.servicio.activarSpinner.emit(false);
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2667]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      resp[0].adicionales = resp[0].adicionales ? resp[0].adicionales : "0;0;0;0;0;0;0";
      resp[0].adicionales = resp[0].adicionales == "NNNNNN" ? "0;0;0;0;0;0;0" : resp[0].adicionales;
      let oee_colores = resp[0].adicionales.split(";");
      resp[0].adic1 = oee_colores[0] ? oee_colores[0] : "0";
      resp[0].adic2 = oee_colores[1] ? oee_colores[1] : "0";
      resp[0].adic3 = oee_colores[2] ? oee_colores[2] : "0";
      resp[0].adic4 = oee_colores[3] ? oee_colores[3] : "0";
      resp[0].adic5 = oee_colores[4] ? oee_colores[4] : "0";
      resp[0].adic6 = oee_colores[5] ? oee_colores[5] : "0";
      resp[0].adic7 = oee_colores[6] ? oee_colores[6] : "0";

      
      resp[0].adicionales_titulos = resp[0].adicionales_titulos ? resp[0].adicionales_titulos : ";;;;;";
      let titulos = resp[0].adicionales_titulos.split(";");
      resp[0].tadic1 = titulos[0] ? titulos[0] : "";
      resp[0].tadic2 = titulos[1] ? titulos[1] : "";
      resp[0].tadic3 = titulos[2] ? titulos[2] : "";
      resp[0].tadic4 = titulos[3] ? titulos[3] : "";
      resp[0].tadic5 = titulos[4] ? titulos[4] : "";
      resp[0].tadic6 = titulos[5] ? titulos[5] : "";

      
      if (oee_colores.length > 0 && !this.yaAgrupado && this.grActual!=3)
      {
        this.resumenes = [];
        this.agrupandoGrafica = id;
        this.titulosGrupos = titulos;
        this.agrupacion = oee_colores;
        this.agregados(0)
        return;
      }
      else if (oee_colores.length == 0)
      {
        this.resumenes = [];
      }
      
      
      resp[0].oee_tipoFTQ = resp[0].oee_tipo[0];
      resp[0].oee_tipoEFI = resp[0].oee_tipo[1];
      resp[0].oee_tipoDIS = resp[0].oee_tipo[2];

      resp[0].oee_selFTQ = resp[0].oee[0] == "S";
      resp[0].oee_selEFI = resp[0].oee[1] == "S";
      resp[0].oee_selDIS = resp[0].oee[2] == "S";
      
      resp[0].oee_etiFTQ = resp[0].oee[3];
      resp[0].oee_etiEFI = resp[0].oee[4];
      resp[0].oee_etiDIS = resp[0].oee[5];

      resp[0].oee_etiFTQ = resp[0].oee_etiFTQ != "S" && resp[0].oee_etiFTQ != "N" ? "N" : resp[0].oee_etiFTQ;
      resp[0].oee_etiEFI = resp[0].oee_etiEFI != "S" && resp[0].oee_etiEFI != "N" ? "N" : resp[0].oee_etiEFI;
      resp[0].oee_etiDIS = resp[0].oee_etiDIS != "S" && resp[0].oee_etiDIS != "N" ? "N" : resp[0].oee_etiDIS;

      resp[0].tipo_valor = resp[0].tipo_principal == "B" ? "bar" : resp[0].tipo_principal == "L" ? "spline" : "area";
      

      resp[0].tipo_valorFTQ = resp[0].oee_tipo[0] == "B" ? "bar" : resp[0].oee_tipo[0] == "L" ? "spline" : "area";
      resp[0].tipo_valorEFI = resp[0].oee_tipo[1] == "B" ? "bar" : resp[0].oee_tipo[1] == "L" ? "spline" : "area";
      resp[0].tipo_valorDIS = resp[0].oee_tipo[2] == "B" ? "bar" : resp[0].oee_tipo[2] == "L" ? "spline" : "area";
      resp[0].colorFTQ = "";
      resp[0].colorEFI = "";
      resp[0].colorDIS = "";
      resp[0].oee_colores = resp[0].oee_colores ? resp[0].oee_colores : ";;";
      
      oee_colores = resp[0].oee_colores.split(";");
      resp[0].colorFTQ = oee_colores[0] ? ("#" + oee_colores[0]) : "";
      resp[0].colorEFI = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].colorDIS = oee_colores[2] ? ("#" + oee_colores[2]) : "";

      resp[0].oee_nombre = resp[0].oee_nombre ? resp[0].oee_nombre : ";;";
      oee_colores = resp[0].oee_nombre.split(";");
      resp[0].oee_nombreFTQ = oee_colores[0];
      resp[0].oee_nombreEFI = oee_colores[1];
      resp[0].oee_nombreDIS = oee_colores[2];

      oee_colores = resp[0].textos_adicionales.split(";");
      resp[0].adic21 = oee_colores[0];
      resp[0].adic22 = oee_colores[1];

      resp[0].esperado_esquema =!resp[0].esperado_esquema ? ";;" : resp[0].esperado_esquema;
      oee_colores = resp[0].esperado_esquema.split(";");
      resp[0].dividir_colores = oee_colores[0] ? oee_colores[0] : "N";
      resp[0].color_bajo = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].color_alto = oee_colores[2] ? ("#" + oee_colores[2]) : "";  
      
      resp[0].adicionales_colores = resp[0].adicionales_colores ? resp[0].adicionales_colores : ";;;;;";
      oee_colores = resp[0].adicionales_colores.split(";");
      resp[0].coladic1 = oee_colores[0] ? ("#" + oee_colores[0]) : "";
      resp[0].coladic2 = oee_colores[1] ? ("#" + oee_colores[1]) : "";
      resp[0].coladic3 = oee_colores[2] ? ("#" + oee_colores[2]) : "";    
      resp[0].coladic4 = oee_colores[3] ? ("#" + oee_colores[3]) : "";    
      resp[0].coladic5 = oee_colores[4] ? ("#" + oee_colores[4]) : "";    
      resp[0].coladic6 = oee_colores[5] ? ("#" + oee_colores[5]) : ""; 
      
      if (!resp[0].sub_titulo || resp[0].sub_titulo == "")
      {
        resp[0].sub_titulo = this.sub_titulo;
      }
         
      this.parGrafica = resp[0];
      this.parGrafica = resp[0];
      let cadTextoY = "";
      if (this.parGrafica.texto_y)
      {
        cadTextoY = this.parGrafica.texto_y.split(";");
      }      
      this.actualIndice = +this.parGrafica.orden;
      this.detalle.texto_y2 = cadTextoY[+this.actualIndice];
      this.parGrafica.overlap = (this.parGrafica.overlap == "R" ? "rotate" : "stagger");
      this.parGrafica.color_barra = (!this.parGrafica.color_barra ? "" : "#" + this.parGrafica.color_barra);
      this.parGrafica.color_esperado = (!this.parGrafica.color_esperado ? "" : "#" + this.parGrafica.color_esperado);
      this.parGrafica.etiqueta_color = (!this.parGrafica.etiqueta_color ? "" : "#" + this.parGrafica.etiqueta_color);
      this.parGrafica.etiqueta_fondo = (!this.parGrafica.etiqueta_fondo ? "" : "#" + this.parGrafica.etiqueta_fondo);
      this.parGrafica.color_fondo = (!this.parGrafica.color_fondo ? "" : "#" + this.parGrafica.color_fondo);
      this.parGrafica.color_fondo_barras = (!this.parGrafica.color_fondo_barras ? "" : "#" + this.parGrafica.color_fondo_barras);
      this.parGrafica.color_letras = (!this.parGrafica.color_letras ? "" : "#" + this.parGrafica.color_letras);
      this.parGrafica.color_leyenda = (!this.parGrafica.color_leyenda ? "" : "#" + this.parGrafica.color_leyenda);
      this.parGrafica.color_leyenda_fondo = (!this.parGrafica.color_leyenda_fondo ? "" : "#" + this.parGrafica.color_leyenda_fondo);
      this.parGrafica.color_spiline = (!this.parGrafica.color_spiline ? "" : "#" + this.parGrafica.color_spiline);
      this.parGrafica.titulo_spiline = (this.parGrafica.grueso_spiline == "0" ? "1" : this.parGrafica.grueso_spiline);
      
      if (this.parGrafica.color_barra.length == 0)
      {
        this.parGrafica.color_barra = "#" + this.servicio.rColores().texto_boton; 
        this.parGrafica.color_barra_borde = "#" + this.servicio.rColores().borde_boton; 
      }

      if (this.parGrafica.color_spiline.length == 0)
      {
        this.parGrafica.color_spiline = "#" + this.servicio.rColores().texto_boton; 
      }

      if (this.parGrafica.color_esperado.length == 0)
      {
        this.parGrafica.color_esperado = "#" + this.servicio.rColores().texto_boton; 
      }

      if (this.parGrafica.etiqueta_color.length == 0)
      {
        this.parGrafica.etiqueta_color = "#" + this.servicio.rColores().texto_boton; 
        this.parGrafica.etiqueta_fondo = "#" + this.servicio.rColores().fondo_boton; 
      }
      if (this.parGrafica.color_fondo.length == 0)
      {
        this.parGrafica.color_fondo = "#" + this.servicio.rColores().fondo_tarjeta; 
      }
      if (this.parGrafica.color_fondo_barras.length == 0)
      {
        this.parGrafica.color_fondo_barras = "transparent";
      }

      if (this.parGrafica.color_letras.length == 0)
      {
        this.parGrafica.color_letras = "#" + this.servicio.rColores().texto_tarjeta; 
      }
      if (this.parGrafica.color_leyenda.length == 0)
      {
        this.parGrafica.color_leyenda = "#" + this.servicio.rColores().texto_boton;
      }
      if (this.parGrafica.color_leyenda_fondo.length == 0)
      {
        this.parGrafica.color_leyenda_fondo = "#" + this.servicio.rColores().fondo_boton;;
      }

      this.idGrafico = this.parGrafica.id;
      this.parGrafica.overlap = (this.parGrafica.overlap == "R" || this.parGrafica.overlap == "rotate" ? "rotate" : "stagger");
        //MTTR
        //Buscar la consulta actual o por defecto
        let sentencia = "";
        if (this.grActual <= 2)
        {
          let tHaving = "";
          let ordenDatos = " 9 DESC";
          if (this.grActual == 2)
          {
            ordenDatos = " 6 DESC";
          }
          if (this.parGrafica.incluir_ceros == "N")
          {
            tHaving = " HAVING CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END > 0 ";
            if (this.grActual == 2)
            {
              tHaving = " HAVING ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 > 0 ";
            }
          }
          if (this.parGrafica.orden_grafica == "N")
          {
            ordenDatos = " 9 ";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 ";
            }
          }
          else  if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 2 ";
          }
          sentencia = "SELECT a.linea, b.nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN " + this.servicio.rBD() + ".disponibilidad AS dismaq ON dismaq.maquina = a.id AND dismaq.estatus = 'A' AND dismaq.linea = 0   LEFT JOIN " + this.servicio.rBD() + ".disponibilidad AS dislin ON dislin.linea = a.linea AND dislin.estatus = 'A' AND dislin.maquina = 0, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0) AS disgen, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF) + " GROUP BY a.linea, b.nombre, e.tdias " + tHaving + " ORDER BY " + ordenDatos + ";";

          if (this.graficaActual == 2)
          {
            ordenDatos = " 8 DESC ";
            if (this.grActual == 2)
            {
              ordenDatos = " 5 DESC ";
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 8 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 5 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.id, a.nombre, e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY linea, maquina) AS c ON a.id = c.maquina, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF) + " GROUP BY a.id, a.nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 3)
          {
            ordenDatos = " 8 DESC ";
            if (this.grActual == 2)
            {
              ordenDatos = " 5 DESC ";
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 8 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 5 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.id, a.nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_areas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT AREA, linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY AREA, linea, maquina) AS c ON a.id = c.AREA, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF_are) + " GROUP BY a.id, a.nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 4)
          {
            ordenDatos = " 8 DESC ";
            if (this.grActual == 2)
            {
              ordenDatos = " 5 DESC ";
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 8 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 5 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.id, a.nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, linea, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY falla_ajustada, linea, maquina) AS c ON a.id = c.falla_ajustada, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF_fal) + " GROUP BY a.id, a.nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 5)
          {
            let ordenDatos = " 9 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 9 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 6 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.tipo, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.tipo = b.id AND b.tabla = 50, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF) + " GROUP BY a.tipo, nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 6)
          {
            let ordenDatos = " 9 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 9 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 6 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.agrupador_1, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 20, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF) + " GROUP BY a.agrupador_1, nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 7)
          {
            let ordenDatos = " 9 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
                
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 9 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 6 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.agrupador_2, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_maquinas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY maquina, linea) AS c ON a.id = c.maquina LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 25, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF) + " GROUP BY a.agrupador_2, nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 8)
          {
            let ordenDatos = " 9 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 9 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 6 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.agrupador_1, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY falla_ajustada, maquina, linea) AS c ON a.id = c.falla_ajustada LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 40, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF_fal) + " GROUP BY a.agrupador_1, nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 9)
          {
            let ordenDatos = " 9 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 6 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 9 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 6 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.agrupador_2, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, COUNT(*), e.tdias, SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END) AS tdisponible, ((SUM(e.lunes * CASE WHEN dismaq.lunes > 0 THEN dismaq.lunes WHEN dislin.lunes > 0 THEN dislin.lunes ELSE disgen.lunes END + e.martes * CASE WHEN dismaq.martes > 0 THEN dismaq.martes WHEN dislin.martes > 0 THEN dislin.martes ELSE disgen.martes END + e.miercoles * CASE WHEN dismaq.miercoles > 0 THEN dismaq.miercoles WHEN dislin.miercoles > 0 THEN dislin.miercoles ELSE disgen.miercoles END + e.jueves * CASE WHEN dismaq.jueves > 0 THEN dismaq.jueves WHEN dislin.jueves > 0 THEN dislin.jueves ELSE disgen.jueves END + e.viernes * CASE WHEN dismaq.viernes > 0 THEN dismaq.viernes WHEN dislin.viernes > 0 THEN dislin.viernes ELSE disgen.viernes END + e.sabado * CASE WHEN dismaq.sabado > 0 THEN dismaq.sabado WHEN dislin.sabado > 0 THEN dislin.sabado ELSE disgen.sabado END + e.domingo * CASE WHEN dismaq.domingo > 0 THEN dismaq.domingo WHEN dislin.domingo > 0 THEN dislin.domingo ELSE disgen.domingo END)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_fallas a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT falla_ajustada, maquina, linea, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY falla_ajustada, maquina, linea) AS c ON a.id = c.falla_ajustada LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 45, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF_fal) + " GROUP BY a.agrupador_2, nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 10)
          {
            let ordenDatos = " 6 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 3 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 6 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 3 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 1 ";
            }
            sentencia = "SELECT a.fecha AS nombre, IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0) AS tdisponible, (IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' GROUP BY nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 11)
          {
            let ordenDatos = " 8 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 5 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 8 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 5 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 1 ";
            }
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', WEEK(a.fecha)) AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(a.fecha,'%x/%v'), ' Monday'), '%x/%v %W') AS inicio, COUNT(*), SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) AS tdisponible, (SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' GROUP BY nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 12)
          {
            let ordenDatos = " 7 DESC";
            if (this.grActual == 2)
            {
              ordenDatos = " 4 DESC";
            }
            if (this.parGrafica.incluir_ceros == "N")
            {
              tHaving = " HAVING mttrc > 0 ";
              if (this.grActual == 2)
              {
                tHaving = " HAVING mtbfc > 0 ";
              }
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 7 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 4 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 1 ";
            }
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', MONTH(a.fecha)) AS nombre, COUNT(*), SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) AS tdisponible, (SUM(IFNULL(CASE WHEN a.dia = 1 THEN g.domingo WHEN a.dia = 2 THEN g.lunes WHEN a.dia = 3 THEN g.martes WHEN a.dia = 4 THEN g.miercoles WHEN a.dia = 5 THEN g.jueves WHEN a.dia = 6 THEN g.viernes ELSE g.sabado END, 0)) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".dias a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT fecha_reporte, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY fecha_reporte) AS c ON a.fecha = c.fecha_reporte, (SELECT * FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND maquina = 0 AND linea = 0 LIMIT 1) AS g WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' GROUP BY nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
          else if (this.graficaActual == 13)
          {
            ordenDatos = " 8 DESC ";
            if (this.grActual == 2)
            {
              ordenDatos = " 5 DESC ";
            }
            if (this.parGrafica.orden_grafica == "N")
            {
              ordenDatos = " 8 ";
              if (this.grActual == 2)
              {
                ordenDatos = " 5 ";
              }
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 2 ";
            }
            sentencia = "SELECT a.id, a.nombre, e.tdias, (e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) AS tdisponible, ((e.lunes + e.martes + e.miercoles + e.jueves + e.viernes + e.sabado + e.domingo) - IFNULL(SUM(c.tiempo), 0)) / CASE WHEN IFNULL(SUM(c.reps), 1) = 0 THEN 1 ELSE IFNULL(SUM(c.reps), 1) END / 3600 AS mtbfc, IFNULL(SUM(c.reps), 0) AS docs, IFNULL(SUM(c.tiempo), 0) AS tiempo_c, CASE WHEN IFNULL(SUM(c.reps), 0) = 0 THEN 0 ELSE IFNULL(SUM(c.tiempo), 0) / IFNULL(SUM(c.reps), 0) / 3600 END AS mttrc FROM " + this.servicio.rBD() + ".cat_usuarios a " + (this.grActual == 1 ? "INNER" : "LEFT") + " JOIN (SELECT tecnicoatend, maquina, COUNT(*) AS reps, SUM(tiemporeparacion + tiempollegada) AS tiempo FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100  AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY tecnicoatend, maquina) AS c ON a.id = c.tecnicoatend, (SELECT COUNT(*) AS tdias, SUM(CASE WHEN dia = 2 THEN 1 ELSE 0 END) * IFNULL((SELECT lunes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS lunes, SUM(CASE WHEN dia = 3 THEN 1 ELSE 0 END) * IFNULL((SELECT martes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS martes, SUM(CASE WHEN dia = 4 THEN 1 ELSE 0 END) * IFNULL((SELECT miercoles FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS miercoles, SUM(CASE WHEN dia = 5 THEN 1 ELSE 0 END) * IFNULL((SELECT jueves FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS jueves, SUM(CASE WHEN dia = 6 THEN 1 ELSE 0 END) * IFNULL((SELECT viernes FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS viernes, SUM(CASE WHEN dia = 7 THEN 1 ELSE 0 END) * IFNULL((SELECT sabado FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS sabado, SUM(CASE WHEN dia = 1 THEN 1 ELSE 0 END) * IFNULL((SELECT domingo FROM " + this.servicio.rBD() + ".disponibilidad WHERE estatus = 'A' AND linea = 0 AND maquina = 0 LIMIT 1), 0) AS domingo FROM " + this.servicio.rBD() + ".dias WHERE  fecha >= '" + this.fDesde + "' AND fecha <= '" + this.fHasta + "' ) AS e " + (this.grActual == 1 ? "" : "WHERE a.id > 0 " + this.filtroMTBF_tec) + " GROUP BY a.id, a.nombre " + tHaving + " ORDER BY " + ordenDatos + ";";
          }
        }
        else if (this.grActual == 3)
        {
          let tHaving = "";
          let ordenDatos = "5"; 
          if (this.parGrafica.orden=="1")
          {
            ordenDatos = "4"; 
          }
          else if (this.parGrafica.orden=="2")
          {
            ordenDatos = "6"; 
          }
          else if (this.parGrafica.orden=="3")
          {
            ordenDatos = "7"; 
          }
          
          if (this.parGrafica.orden_grafica == "M")
          {
            ordenDatos = ordenDatos + " DESC";
          }
          else if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 1 ";
          }
          sentencia = "SELECT d.nombre, d.referencia, c.linea, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_lineas d ON c.linea = d.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY c.linea, d.nombre " + tHaving + " ORDER BY " + ordenDatos

          if (this.graficaActual == 2)
          {
            sentencia = "SELECT d.nombre, d.referencia, c.maquina, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.maquina = d.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY c.maquina, d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 3)
          {
            sentencia = "SELECT d.nombre, d.referencia, c.area, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_areas d ON c.area = d.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY c.area, d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 4)
          {
            sentencia = "SELECT d.nombre, d.referencia, c.falla_ajustada, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_fallas d ON c.falla_ajustada = d.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY c.falla_ajustada, d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 5)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, d.tipo AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.maquina = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON d.tipo = b.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY id, nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 6)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, d.agrupador_1 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.maquina = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON d.agrupador_1 = b.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY id, nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 7)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, d.agrupador_2 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.maquina = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON d.agrupador_2 = b.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY id, nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 8)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, d.agrupador_1 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_fallas d ON c.falla_ajustada = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON d.agrupador_1 = b.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY id, nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 9)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, d.agrupador_2 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_fallas d ON c.falla_ajustada = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON d.agrupador_2 = b.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY id, nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 10)
          {
            sentencia = "SELECT c.fecha_reporte AS nombre, '' AS referencia, 0 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 11)
          {
            sentencia = "SELECT CONCAT(YEAR(c.fecha_reporte), '/', WEEK(c.fecha_reporte))  AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(c.fecha_reporte,'%x/%v'), ' Monday'), '%x/%v %W') AS referencia, 0 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 12)
          {
            sentencia = "SELECT CONCAT(YEAR(c.fecha_reporte), '/', MONTH(c.fecha_reporte)) AS nombre, '' AS referencia, 0 AS id, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
          }
          else if (this.graficaActual == 13)
          {
            sentencia = "SELECT d.nombre, d.referencia, c.tecnicoatend, COUNT(*) AS docs, SUM(c.tiemporeparacion + c.tiempollegada) / 3600 AS tiempo, SUM(c.tiempollegada) / 3600 AS loca, SUM(c.tiemporeparacion) / 3600 AS repa, 0 AS porcentaje FROM " + this.servicio.rBD() + ".reportes c INNER JOIN " + this.servicio.rBD() + ".cat_usuarios d ON c.tecnicoatend = d.id WHERE c.contabilizar = 'S' AND c.estatus >= 100 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroReportes + " GROUP BY c.tecnicoatend, d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
        }
        else if (this.grActual == 4)
        {
          sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.linea, b.referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroCorte + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + this.filtroOEE + " GROUP BY a.linea, nombre, b.referencia ";
          if (this.graficaActual == 2)
          {
            sentencia = "SELECT a.id, IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.referencia, 0 AS tmaquinas, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nlinea, a.linea, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroCorte + " GROUP BY j.id) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + this.filtroOEE + " GROUP BY a.id, nombre, a.referencia, nlinea, a.linea ";
          }
          else if (this.graficaActual == 3)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.tipo AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.tipo = b.id AND b.tabla = 50 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroCorte + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + this.filtroOEE + " GROUP BY a.tipo, nombre ";
          }
          else if (this.graficaActual == 4)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.agrupador_1 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_1 = b.id AND b.tabla = 20 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroCorte + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + this.filtroOEE + " GROUP BY a.agrupador_1, nombre ";
          }
          else if (this.graficaActual == 5)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.agrupador_2 AS linea, '' AS referencia, COUNT(a.id) AS tmaquinas, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.agrupador_2 = b.id AND b.tabla = 25 LEFT JOIN (SELECT i.equipo, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroCorte + " GROUP BY i.equipo) AS i ON i.equipo = a.id WHERE a.oee = 'S' " + this.filtroOEE + " GROUP BY a.agrupador_2, nombre ";
          }
          else if (this.graficaActual == 6)
          {
            sentencia = "SELECT fecha AS nombre, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + this.filtroOEEDias + " WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' GROUP BY a.fecha  ";
          }
          else if (this.graficaActual == 7)
          {
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', WEEK(a.fecha)) AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(a.fecha,'%x/%v'), ' Monday'), '%x/%v %W') AS inicio, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + this.filtroOEEDias + " WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' GROUP BY nombre  ";
          }
          else if (this.graficaActual == 8)
          {
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', MONTH(a.fecha)) AS nombre, IFNULL(SUM(i.paros), 0) AS paros_m, IFNULL(SUM(i.produccion), 0) AS produccion_m, IFNULL(SUM(i.piezas), 0) AS piezas_m, IFNULL(SUM(i.rechazos), 0) AS rechazos_m, IFNULL(SUM(i.calidad), 0) AS calidad_m, IFNULL(SUM(i.disponible), 0) AS disponible_m FROM " + this.servicio.rBD() + ".dias a LEFT JOIN (SELECT i.dia, SUM(i.paro) AS paros, SUM(i.produccion_tc) AS produccion, SUM(i.produccion) AS piezas, SUM(i.calidad) AS rechazos, SUM(i.tiempo_disponible) AS disponible, SUM(i.calidad_tc) AS calidad  FROM (SELECT a.equipo, a.fecha AS dia, 0 AS paro, a.parte, a.turno, a.lote AS orden, 0 AS produccion_tc, 0 AS produccion, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, 0 AS paro, parte, turno, orden, 0 AS produccion_tc, 0 AS produccion, calidad, calidad_tc, 0 AS tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 AND dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "' UNION ALL SELECT equipo, dia, paro, parte, turno, orden, produccion_tc, produccion, 0 AS calidad, 0 AS calidad_tc, tiempo_disponible FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE dia >= '" + this.fDesde + "' AND dia <= '" + this.fHasta + "') AS i INNER JOIN " + this.servicio.rBD() + ".cat_maquinas j ON i.equipo = j.id AND j.oee = 'S' " + this.filtroOEEDias + " WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "'  GROUP BY dia) AS i ON i.dia = a.fecha WHERE a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' GROUP BY nombre  ";
          }          
        }
        else if (this.grActual == 5)
        {
          let tHaving = "";
          let ordenDatos = "5"; 
          if (this.parGrafica.incluir_ceros == "N")
          {
            tHaving = " HAVING docs > 0 ";
          }
          if (this.parGrafica.orden=="1")
          {
            ordenDatos = "4"; 
          }
          
          if (this.parGrafica.orden_grafica == "M")
          {
            ordenDatos = ordenDatos + " DESC";
          }
          else if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 1 ";
          }

          sentencia = "SELECT IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, c.referencia, c.id, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON b.linea = c.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;

          if (this.graficaActual == 2)
          {
            sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, b.referencia, a.maquina, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          else if (this.graficaActual == 3)
          {
            sentencia = "SELECT IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, a.area, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON a.area = c.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          else if (this.graficaActual == 4)
          {
            sentencia = "SELECT IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, a.tipo, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON a.tipo = c.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          else if (this.graficaActual == 5)
          {

            sentencia = "SELECT a.fecha AS nombre, '' AS referencia, 0 AS id, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
            
          }
          else if (this.graficaActual == 6)
          {
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', WEEK(a.fecha)) AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(a.fecha, '%x/%v'), ' Monday'), '%x/%v %W') AS referencia, 0 AS id, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
            
          }
          else if (this.graficaActual == 7)
          {
            sentencia = "SELECT CONCAT(YEAR(a.fecha), '/', MONTH(a.fecha)) AS nombre, '' AS referencia, 0 AS id, COUNT(*) AS docs, SUM(a.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".detalleparos a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.maquina = b.id WHERE a.estado = 'F' AND a.fecha >= '" + this.fDesde + "' AND a.fecha <= '" + this.fHasta + "' " + this.filtroParos + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          
        }

        else if (this.grActual == 6)
        {
          let tHaving = "";
          if (this.parGrafica.incluir_ceros == "N")
          {
            tHaving = " HAVING docs > 0 ";
          }
          let ordenDatos = "5"; 
          if (this.parGrafica.orden=="1")
          {
            ordenDatos = "4"; 
          }
          
          if (this.parGrafica.orden_grafica == "M")
          {
            ordenDatos = ordenDatos + " DESC";
          }
          else if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 1 ";
          }

          sentencia = "SELECT IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, b.referencia, a.linea AS id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.equipo, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.equipo) AS i LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas a ON i.equipo = a.id AND a.oee = 'S' LEFT JOIN " + this.servicio.rBD() + ".cat_lineas b ON a.linea = b.id GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;

          if (this.graficaActual == 2)
          {
            sentencia = "SELECT IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, a.referencia, a.id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.equipo, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.equipo) AS i LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas a ON i.equipo = a.id WHERE a.oee = 'S' GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;

          }
          else if (this.graficaActual == 3)
          {
            sentencia = "SELECT IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nombre, '' AS referencia, a.id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.area, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.area) AS i LEFT JOIN " + this.servicio.rBD() + ".cat_generales a ON i.area = a.id GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          else if (this.graficaActual == 4)
          {
            sentencia = "SELECT IFNULL(a.nombre, '" + this.servicio.rTraduccion()[3759] + "') AS nombre, '' AS referencia, a.id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.tipo, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.tipo) AS i LEFT JOIN " + this.servicio.rBD() + ".cat_generales a ON i.tipo = a.id GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos;
          }
          else if (this.graficaActual == 5)
          {

            sentencia = "SELECT i.dia AS nombre, '' AS referencia, 0 AS id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.dia, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.dia) AS i GROUP BY 1 ORDER BY " + ordenDatos;
            
          }
          else if (this.graficaActual == 6)
          {
            sentencia = "SELECT CONCAT(YEAR(i.dia), '/', WEEK(i.dia)) AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(i.dia, '%x/%v'), ' Monday'), '%x/%v %W') AS referencia, 0 AS id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.dia, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.dia) AS i GROUP BY 1 ORDER BY " + ordenDatos;
            
          }
          else if (this.graficaActual == 7)
          {
            sentencia = "SELECT CONCAT(YEAR(i.dia), '/', MONTH(i.dia)) AS nombre, '' AS referencia, 0 AS id, IFNULL(SUM(i.rechazos), 0) AS docs, IFNULL(SUM(i.calidad), 0) / 3600 AS tiempo, 0 AS porcentaje FROM (SELECT i.dia, SUM(i.calidad) AS rechazos, SUM(i.calidad_tc) AS calidad FROM (SELECT a.equipo, a.area, a.tipo, a.fecha AS dia, a.parte, a.turno, a.lote AS orden, a.cantidad AS calidad, a.cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos a INNER JOIN " + this.servicio.rBD() + ".lecturas_cortes b ON a.corte = b.id UNION ALL SELECT equipo, 0 AS area, 0 AS tipo, dia, parte, turno, orden, calidad, calidad_tc FROM " + this.servicio.rBD() + ".lecturas_cortes WHERE calidad - calidad_clasificada > 0 UNION ALL SELECT equipo, area, tipo, fecha AS dia, parte, turno, lote AS orden, cantidad AS calidad, cantidad_tc AS calidad_tc FROM " + this.servicio.rBD() + ".detallerechazos WHERE corte = 0) AS i LEFT JOIN sigma.cat_maquinas j ON i.equipo = j.id WHERE i.dia >= '" + this.fDesde + "' AND i.dia <= '" + this.fHasta + "' " + this.filtroRechazos + " GROUP BY i.dia) AS i GROUP BY 1 ORDER BY " + ordenDatos;
          }
          
        }
        else if (this.grActual == 7)
        {
          this.parGrafica.orden = !this.parGrafica.orden ? 0 : +this.parGrafica.orden;
          let tHaving = "";
          let ordenDatos = "6"; 
          if (this.parGrafica.orden == 1)
          {
            ordenDatos = "7"; 
          }
          if (this.parGrafica.orden_grafica == "M")
          {
            ordenDatos = ordenDatos + " DESC";
          }
          else if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 1 ";
          }
          let tablaUnion = "";
          let tablaID = "";

          if (this.graficaActual <= 3)
          {
            if (this.graficaActual == 1)
            {
              tablaUnion = ".cat_areas d ON c.area";
              tablaID = "c.area";
            }
            else if (this.graficaActual == 2)
            {
              tablaUnion = ".cat_turnos d ON c.turno_inicio";
              tablaID = "c.turno_inicio";
            }
            else if (this.graficaActual == 3)
            {
              tablaUnion = ".cat_usuarios d ON c.usuario_asignado";
              tablaID = "c.usuario_asignado";
            }

            sentencia = "SELECT d.nombre, " + (this.graficaActual == 5 ? "d.referencia, " : "") + tablaID + " AS id, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".rkanban_cab c INNER JOIN " + this.servicio.rBD() + tablaUnion + " = d.id WHERE c.estado >= 50 AND c.inicio >= '" + this.fDesde + " 00:00:00' AND c.inicio <= '" + this.fHasta + " 23:59:59' " + this.filtroKanban + " GROUP BY d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else 
          {
            let ordenDatos = "5"; 
            if (this.parGrafica.orden == 1)
            {
              ordenDatos = "6"; 
            }
            if (this.parGrafica.orden_grafica == "M")
            {
              ordenDatos = ordenDatos + " DESC";
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 1 ";
            }
            if (this.graficaActual == 4)
            {
              sentencia = "SELECT DATE_FORMAT(c.inicio, '%d/%m/%Y') AS nombre, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".rkanban_cab c WHERE c.estado >= 50 AND c.inicio >= '" + this.fDesde + " 00:00:00' AND c.inicio <= '" + this.fHasta + " 23:59:59' " + this.filtroKanban + " GROUP BY DATE_FORMAT(c.inicio, '%d/%m/%Y') " + tHaving + " ORDER BY " + ordenDatos
            }
            else if (this.graficaActual == 5)
            {
              let ordenDatos = "6"; 
              if (this.parGrafica.orden == 1)
              {
                ordenDatos = "7"; 
              }
              if (this.parGrafica.orden_grafica == "M")
              {
                ordenDatos = ordenDatos + " DESC";
              }
              else if (this.parGrafica.orden_grafica == "A")
              {
                ordenDatos = " 1 ";
              }
              sentencia = "SELECT CONCAT(YEAR(c.inicio), '/', WEEK(c.inicio))  AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(c.inicio,'%x/%v'), ' Monday'), '%x/%v %W') AS referencia, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".rkanban_cab c WHERE c.estado >= 50 AND c.inicio >= '" + this.fDesde + " 00:00:00' AND c.inicio <= '" + this.fHasta + " 23:59:59' " + this.filtroKanban + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
            }
            else if (this.graficaActual == 6)
            {
              sentencia = "SELECT CONCAT(YEAR(c.inicio), '/', MONTH(c.inicio)) AS nombre, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".rkanban_cab c WHERE c.estado >= 50 AND c.inicio >= '" + this.fDesde + " 00:00:00' AND c.inicio <= '" + this.fHasta + " 23:59:59' " + this.filtroKanban + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
            }
          }
        }
        else if (this.grActual == 8)
        {
          this.parGrafica.orden = !this.parGrafica.orden ? 0 : +this.parGrafica.orden;
          let tHaving = "";
          let ordenDatos = "6"; 
          if (this.parGrafica.orden == 1)
          {
            ordenDatos = "7"; 
          }
          if (this.parGrafica.orden_grafica == "M")
          {
            ordenDatos = ordenDatos + " DESC";
          }
          else if (this.parGrafica.orden_grafica == "A")
          {
            ordenDatos = " 1 ";
          }
          let tablaUnion = "";
          let tablaID = "";

          if (this.graficaActual <= 5)
          {
            if (this.graficaActual == 1)
            {
              tablaUnion = ".cat_areas d ON c.area";
              tablaID = "c.area";
            }
            else if (this.graficaActual == 2)
            {
              tablaUnion = ".cat_turnos d ON c.turno_entrega";
              tablaID = "c.turno_entrega";
            }
            else if (this.graficaActual == 3)
            {
              tablaUnion = ".cat_usuarios d ON c.surtidor";
              tablaID = "c.surtidor";
            }
            else if (this.graficaActual == 4)
            {
              tablaUnion = ".cat_procesos d ON c.proceso";
              tablaID = "c.proceso";
            }
            else if (this.graficaActual == 5)
            {
              tablaUnion = ".cat_partes d ON c.parte";
              tablaID = "c.parte";
              let ordenDatos = "7"; 
              if (this.parGrafica.orden == 1)
              {
                ordenDatos = "8"; 
              }
              if (this.parGrafica.orden_grafica == "M")
              {
                ordenDatos = ordenDatos + " DESC";
              }
              else if (this.parGrafica.orden_grafica == "A")
              {
                ordenDatos = " 1 ";
              }
            }

            sentencia = "SELECT d.nombre, " + (this.graficaActual == 5 ? "d.referencia, " : "") + tablaID + " AS id, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".kanban_solicitudes c INNER JOIN " + this.servicio.rBD() + tablaUnion + " = d.id WHERE c.contabilizar = 'S' AND c.estado >= 50 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroKanban + " GROUP BY d.nombre " + tHaving + " ORDER BY " + ordenDatos
          }
          else 
          {
            let ordenDatos = "5"; 
            if (this.parGrafica.orden == 1)
            {
              ordenDatos = "6"; 
            }
            if (this.parGrafica.orden_grafica == "M")
            {
              ordenDatos = ordenDatos + " DESC";
            }
            else if (this.parGrafica.orden_grafica == "A")
            {
              ordenDatos = " 1 ";
            }
            if (this.graficaActual == 6)
            {
              sentencia = "SELECT c.fecha_reporte AS nombre, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".kanban_solicitudes c WHERE c.contabilizar = 'S' AND c.estado >= 50 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroKanban + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
            }
            else if (this.graficaActual == 7)
            {
              let ordenDatos = "6"; 
              if (this.parGrafica.orden == 1)
              {
                ordenDatos = "7"; 
              }
              if (this.parGrafica.orden_grafica == "M")
              {
                ordenDatos = ordenDatos + " DESC";
              }
              else if (this.parGrafica.orden_grafica == "A")
              {
                ordenDatos = " 1 ";
              }
              sentencia = "SELECT CONCAT(YEAR(c.fecha_reporte), '/', WEEK(c.fecha_reporte))  AS nombre, STR_TO_DATE(CONCAT(DATE_FORMAT(c.fecha_reporte,'%x/%v'), ' Monday'), '%x/%v %W') AS referencia, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".kanban_solicitudes c WHERE c.contabilizar = 'S' AND c.estado >= 50 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroKanban + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
            }
            else if (this.graficaActual == 8)
            {
              sentencia = "SELECT CONCAT(YEAR(c.fecha_reporte), '/', MONTH(c.fecha_reporte)) AS nombre, COUNT(*) AS docs, SUM(CASE WHEN c.evaluacion = 'N' THEN 1 ELSE 0 END) AS nega, SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) AS posi, CASE WHEN COUNT(*) > 0 THEN SUM(CASE WHEN c.evaluacion = 'P' THEN 1 ELSE 0 END) / COUNT(*) * 100 ELSE 0 END AS positivos, SUM(c.tiempo) / 3600 AS tiempo, 0 AS porcentaje FROM " + this.servicio.rBD() + ".kanban_solicitudes c WHERE c.contabilizar = 'S' AND c.estado >= 50 AND c.fecha_reporte >= '" + this.fDesde + "' AND c.fecha_reporte <= '" + this.fHasta + "' " + this.filtroKanban + " GROUP BY 1 " + tHaving + " ORDER BY " + ordenDatos
            }
          }
        }

        this.cadSQLActual = sentencia;
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          
          if (this.resumenes.length > 0 && this.grActual <= 2)
          {
            this.miGraficaTotal = this.resumenes.concat(JSON.parse(JSON.stringify(resp)));
          }
          else
          {
            this.miGraficaTotal = JSON.parse(JSON.stringify(resp));
          }
          //if (this.modelo == 0)
          //{
          //  this.modelo = 1;
          //}
          if (resp.length > 0)
          {
            
            if (this.grActual == 1)
            {
              this.variable = "mttr";
              this.variable_literal = this.servicio.rTraduccion()[2673]
              this.variable_2 = "mttrc";
              
            }
            else if (this.grActual == 2)
            {
              this.variable_o = "impacto";
              this.variable = "mtbf";
              this.variable_literal = this.servicio.rTraduccion()[2672]
              this.variable_2 = "mtbfc";
              
            }
            else if (this.grActual == 3 || this.grActual == 5 || this.grActual == 6)
            {
              this.variable_o = "";
              this.variable = (this.parGrafica.orden == 1 ? "docs" : this.parGrafica.orden == 2 ? "loca" : this.parGrafica.orden == 3 ? "repa" : "tiempo");
              if (this.grActual == 6)
              {
                this.variable_literal = (this.parGrafica.orden == 1 ? this.servicio.rTraduccion()[2108] : this.servicio.rTraduccion()[2675]);
              }
              else if (this.grActual == 5)
              {
                this.variable_literal = (this.parGrafica.orden == 1 ? this.servicio.rTraduccion()[2674] : this.servicio.rTraduccion()[2676]);
              }
              else
              {
                this.variable_literal = (this.parGrafica.orden == 1 ? this.servicio.rTraduccion()[2671]  : this.parGrafica.orden == 2 ? this.servicio.rTraduccion()[3530] : this.parGrafica.orden == 1 ? this.servicio.rTraduccion()[3531] : this.servicio.rTraduccion()[2677]);
              }
              this.variable_2 = (this.parGrafica.orden == 1 ? "docs" : "tiempo");
              this.variable_2 = (this.parGrafica.orden == 1 ? "docs" : this.parGrafica.orden == 2 ? "loca" : this.parGrafica.orden == 3 ? "repa" : "tiempo");
              
            }
            else if (this.grActual == 7 || this.grActual == 8)
            {
              this.variable_literal = this.servicio.rTraduccion()[4314]
              this.variable = (this.parGrafica.orden == 0 ? "positivos" : "tiempo");
              this.variable_2 = (this.parGrafica.orden == 0 ? "positivos" : "tiempo");
            }
            else if (this.grActual == 4)
            {
              this.variable_2 = "oee";

              this.variable_o = "";

              this.variableefi = "efi";
              this.variableefi_literal = (!this.parGrafica.oee_nombreEFI ? "*" + this.servicio.rTraduccion()[575] : this.parGrafica.oee_nombreEFI);
              this.variableefi_2 = "efi";

              this.variableftq = "ftq";
              this.variableftq_literal = (!this.parGrafica.oee_nombreFTQ ? "*" + this.servicio.rTraduccion()[1811] : this.parGrafica.oee_nombreFTQ);
              this.variableftq_2 = "ftq";

              this.variabledis = "dis";
              this.variabledis_literal = (!this.parGrafica.oee_nombreDIS ?  "*" + this.servicio.rTraduccion()[577] : this.parGrafica.oee_nombreDIS);
              this.variabledis_2 = "dis";

              this.variableoee = "oee";
              this.variableoee_literal = this.servicio.rTraduccion()[536];
              this.variableoee_2 = "oee";

              //Se calculan los indicadores
              let t01 = 0;
              let t02 = 0;
              let t03 = 0;
              let t04 = 0;
              let t05 = 0;
              let t06 = 0;
              let t07 = 0;

              this.miGraficaSF = resp.slice();

              for (i = resp.length - 1; i >= 0; i--)
              {
                resp[i].efi = 0;
                resp[i].ftq = 0;
                resp[i].dis = 0;
                resp[i].oee = 0;
                //
                t01 = t01 + +resp[i].disponible_m;
                t02 = t02 + +resp[i].paros_m;
                t03 = t03 + +resp[i].produccion_m;
                t04 = t04 + +resp[i].calidad_m;
                t05 = t05 + +resp[i].tmaquinas;
                t06 = t06 + +resp[i].piezas_m;
                t07 = t07 + +resp[i].rechazos_m;
                //
                if (resp[i].disponible_m > 0)
                {
                  resp[i].dis = (+resp[i].disponible_m - +resp[i].paros_m) / +resp[i].disponible_m * 100;    
                  resp[i].dis = resp[i].dis > 100 ? 100 : resp[i].dis < 0 ? 0 : resp[i].dis;
                }
                if ((+resp[i].disponible_m - +resp[i].paros_m) > 0)
                {
                  resp[i].efi = +resp[i].produccion_m / (+resp[i].disponible_m - +resp[i].paros_m) * 100;        
                  resp[i].efi = resp[i].efi > 100 ? 100 : resp[i].efi;
                }
                if (resp[i].produccion_m > 0)
                {
                  resp[i].ftq = (+resp[i].produccion_m - +resp[i].calidad_m) / +resp[i].produccion_m * 100;        
                  resp[i].ftq = resp[i].ftq > 100 ? 100 : resp[i].ftq;
                }
                resp[i].oee = +resp[i].dis * +resp[i].efi * +resp[i].ftq / 10000;
                this.miGraficaSF[i].oee = resp[i].oee;
                this.miGraficaSF[i].dis = resp[i].dis;
                this.miGraficaSF[i].ftq = resp[i].ftq;
                this.miGraficaSF[i].efi = resp[i].efi;
                this.miGraficaTotal[i].oee = resp[i].oee;
                this.miGraficaTotal[i].dis = resp[i].dis;
                this.miGraficaTotal[i].ftq = resp[i].ftq;
                this.miGraficaTotal[i].efi = resp[i].efi;
                if (Math.round(resp[i].oee) == 0 && this.parGrafica.incluir_ceros == "N")
                {
                    resp.splice(i, 1);
                }

              //
              } 
              
              //Se agrega el resumen (validar si se desea o no)
              
              if (this.parGrafica.orden_grafica)
              {
                if (this.parGrafica.orden_grafica == "A")
                {
                  resp.sort(this.ordenarALF("nombre", 1))
                }
                else if (this.parGrafica.orden_grafica == "N")
                {
                  resp.sort(this.ordenarNum(this.variable_2, 1))
                }
                else
                {
                  resp.sort(this.ordenarNum(this.variable_2, -1))
                }
              }
              else
              {
                resp.sort(this.ordenarNum(this.variable_2, 1))
              }

              resp.splice(0, 0, {nombre: this.servicio.rTraduccion()[2785], referencia: '', linea: '', disponible_m: t01, paros_m: t02, produccion_m: t03, calidad_m: t04, tmaquinas: t05, piezas_m: t06, rechazos_m: t07 }); 
              this.miGraficaSF.splice(0, 0, {nombre: this.servicio.rTraduccion()[2785], referencia: '', linea: '', disponible_m: t01, paros_m: t02, produccion_m: t03, calidad_m: t04, tmaquinas: t05, piezas_m: t06, rechazos_m: t07 }); 
              resp[0].dis = 0;
              resp[0].efi = 0;
              resp[0].oee = 0;
              resp[0].ftq = 0;
              if (resp[0].disponible_m > 0)
                {
                  resp[0].dis = (+resp[0].disponible_m - +resp[0].paros_m) / +resp[0].disponible_m * 100;    
                  resp[0].dis = resp[0].dis > 100 ? 100 : resp[0].dis;
                }
                if ((+resp[0].disponible_m - +resp[0].paros_m) > 0)
                {
                  resp[0].efi = +resp[0].produccion_m / (+resp[0].disponible_m - +resp[0].paros_m) * 100;        
                  resp[0].efi = resp[0].efi > 100 ? 100 : resp[0].efi;
                }
                if (resp[0].produccion_m > 0)
                {
                  resp[0].ftq = (+resp[0].produccion_m - +resp[0].calidad_m) / +resp[0].produccion_m * 100;        
                  resp[0].ftq = resp[0].ftq > 100 ? 100 : resp[0].ftq;
                }
                resp[0].oee = +resp[0].dis * +resp[0].efi * +resp[0].ftq / 10000;
                this.miGraficaSF[0].oee = resp[0].oee;
                this.miGraficaSF[0].dis = resp[0].dis;
                this.miGraficaSF[0].ftq = resp[0].ftq;
                this.miGraficaSF[0].efi = resp[0].efi;
                
              if (this.resumenes.length > 0)
              {
                this.miGraficaTotal = this.resumenes.concat(JSON.parse(JSON.stringify(this.miGraficaSF)));
                
                //Se calculan los indicadores
                let t01 = 0;
                let t02 = 0;
                let t03 = 0;
                let t04 = 0;
                let t05 = 0;
                let t06 = 0;
                let t07 = 0;

                for (var i = 0; i < this.resumenes.length; i++)
                {
                  this.miGraficaTotal[i].efi = 0;
                  this.miGraficaTotal[i].ftq = 0;
                  this.miGraficaTotal[i].dis = 0;
                  this.miGraficaTotal[i].oee = 0;
                  //
                  t01 = t01 + +this.miGraficaTotal[i].disponible_m;
                  t02 = t02 + +this.miGraficaTotal[i].paros_m;
                  t03 = t03 + +this.miGraficaTotal[i].produccion_m;
                  t04 = t04 + +this.miGraficaTotal[i].calidad_m;
                  t05 = t05 + +this.miGraficaTotal[i].tmaquinas;
                  t06 = t06 + +this.miGraficaTotal[i].piezas_m;
                  t07 = t07 + +this.miGraficaTotal[i].rechazos_m;
                  //
                  if (this.miGraficaTotal[i].disponible_m > 0)
                  {
                    this.miGraficaTotal[i].dis = (+this.miGraficaTotal[i].disponible_m - +this.miGraficaTotal[i].paros_m) / +this.miGraficaTotal[i].disponible_m * 100;    
                    this.miGraficaTotal[i].dis = this.miGraficaTotal[i].dis > 100 ? 100 : this.miGraficaTotal[i].dis;
                  }
                  if ((+this.miGraficaTotal[i].disponible_m - +this.miGraficaTotal[i].paros_m) > 0)
                  {
                    this.miGraficaTotal[i].efi = +this.miGraficaTotal[i].produccion_m / (+this.miGraficaTotal[i].disponible_m - +this.miGraficaTotal[i].paros_m) * 100;        
                    this.miGraficaTotal[i].efi = this.miGraficaTotal[i].efi > 100 ? 100 : this.miGraficaTotal[i].efi;
                  }
                  if (this.miGraficaTotal[i].produccion_m > 0)
                  {
                    this.miGraficaTotal[i].ftq = (+this.miGraficaTotal[i].produccion_m - +this.miGraficaTotal[i].calidad_m) / +this.miGraficaTotal[i].produccion_m * 100;        
                    this.miGraficaTotal[i].ftq = this.miGraficaTotal[i].ftq > 100 ? 100 : this.miGraficaTotal[i].ftq;
                  }
                  this.miGraficaTotal[i].oee = +this.miGraficaTotal[i].dis * +this.miGraficaTotal[i].efi * +this.miGraficaTotal[i].ftq / 10000;
                  this.miGraficaTotal[i].oee = this.miGraficaTotal[i].oee;
                  this.miGraficaTotal[i].dis = this.miGraficaTotal[i].dis;
                  this.miGraficaTotal[i].ftq = this.miGraficaTotal[i].ftq;
                  this.miGraficaTotal[i].efi = this.miGraficaTotal[i].efi;
                //
                } 
              }              

            }
            else
            {
              this.miGraficaTotal = JSON.parse(JSON.stringify(resp));
            }
            

            let limitar = 0;
            let agrupado;
            let total = 0;
            if (+this.parGrafica.maximo_barraspct > 0 && +this.parGrafica.maximo_barraspct < 100)
            {
              let pct = +this.parGrafica.maximo_barraspct / 100;
              
              for (var i = 0; i < resp.length; i++)
              {
                total = total + +resp[i][this.variable_2];
              }
              let pcAcum = 0;
              for (var i = 0; i < resp.length; i++)
              {
                pcAcum = pcAcum + +resp[i][this.variable_2];
                if (pcAcum / total >= pct)
                {
                  limitar = i + 1;
                  break;
                }
              }
                          
            }
            if (+this.parGrafica.maximo_barras > 0)
            {
              if (limitar > +this.parGrafica.maximo_barras || limitar == 0)
              {
                limitar= +this.parGrafica.maximo_barras;
              }
            }
            if (limitar + 1 >= resp.length && this.parGrafica.agrupar == "S")
            {
              limitar = 0;
            }
            else if (limitar  >= resp.length)
            {
              limitar = 0;
            }
            if (limitar > 0)
            {
              if (this.parGrafica.agrupar == "S")
              {
                let faltante = 0;
                let totalAgr = 0;
                if (this.grActual == 1)
                {
                  for (var i = limitar; i < resp.length; i++)
                  {
                    faltante = faltante + +resp[i].mttrc;
                  }
                  totalAgr = resp.length - limitar;
                  agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: 0, tdisponible: 0, mttrc: faltante, mtbfc: 0, porcentaje: 0  }
                }
                else if (this.grActual == 2)
                {
                  for (var i = limitar; i < resp.length; i++)
                  {
                    faltante = faltante + +resp[i].mtbfc;
                  }
                  totalAgr = resp.length - limitar;
                  agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: 0, tdisponible: 0, mttrc: 0, mtbfc: faltante, porcentaje: 0 }
                }
                else if (this.grActual == 3 || this.grActual == 5 || this.grActual == 6)
                {
                  if (this.parGrafica.orden == 1)
                  {
                    for (var i = limitar; i < resp.length; i++)
                    {
                      faltante = faltante + +resp[i].docs;
                    }
                    totalAgr = resp.length - limitar;
                     agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: 0, loca: 0, repa: 0, porcentaje: 0, docs: faltante }
                  }
                  else if (this.parGrafica.orden == 2)
                  {
                    for (var i = limitar; i < resp.length; i++)
                    {
                      faltante = faltante + +resp[i].loca;
                    }
                    totalAgr = resp.length - limitar;
                     agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: 0, loca: faltante, repa: 0, porcentaje: 0, docs: 0 }
                  }
                  else if (this.parGrafica.orden == 3)
                  {
                    for (var i = limitar; i < resp.length; i++)
                    {
                      faltante = faltante + +resp[i].repa;
                    }
                    totalAgr = resp.length - limitar;
                     agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: 0, loca: 0, repa: faltante, porcentaje: 0, docs: 0 }
                  }
                  else
                  {
                    for (var i = limitar; i < resp.length; i++)
                  {
                    faltante = faltante + +resp[i].tiempo;
                  }
                  totalAgr = resp.length - limitar;
                   agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto)  + " (" + totalAgr + ")", tiempo: faltante, porcentaje: 0, docs: 0 }
                  }
                  
                }
                else if (this.grActual == 8)
                  {
                    let a1 = 0;
                    let a2 = 0;
                    let a3 = 0;
                    for (var i = limitar; i < resp.length; i++)
                    {
                      a1 = a1 + +resp[i].posi;
                      a2 = a2 + +resp[i].nega;
                      a3 = a3 + +resp[i].nega;
                      faltante = faltante + +resp[i].positivos;
                    }
                    totalAgr = resp.length - limitar;

                    agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", tiempo: a3, posi: a1, nega: a2, positivos: faltante, porcentaje: 0 }
                  }
                else
                {
                  let faltante1 = 0;
                  let faltante2 = 0;
                  let faltante3 = 0;
                  let faltante4 = 0;
                  let faltante5 = 0;
                  let faltante6 = 0;
                  let totalAgr = 0;
                  for (var i = limitar; i < resp.length; i++)
                  {
                    faltante1 = faltante1 + +resp[i].paros_m;
                    faltante2 = faltante2 + +resp[i].piezas_m;
                    faltante3 = faltante3 + +resp[i].produccion_m;
                    faltante4 = faltante4 + +resp[i].rechazos_m;
                    faltante5 = faltante5 + +resp[i].calidad_m;
                    faltante6 = faltante6 + +resp[i].disponible_m;
                  }
                  let miDIS = 0;
                  let miOEE = 0;
                  let miFTQ = 0;
                  let miEFI = 0;

                  if (faltante6 > 0)
                  {
                    miDIS = (faltante6 - faltante1) / faltante6 * 100;    
                    miDIS = miDIS > 100 ? 100 : miDIS;
                  }
                  if ((+faltante6 - faltante1) > 0)
                  {
                    miEFI = faltante3 / (faltante6 - faltante1) * 100;        
                    miEFI = miEFI > 100 ? 100 : miEFI;
                  }
                  if (faltante3 > 0)
                  {
                    miFTQ = (faltante3 - faltante5) / faltante3 * 100;        
                    miFTQ = miFTQ > 100 ? 100 : miFTQ;
                  }
                  miOEE = +miDIS * +miEFI * +miFTQ / 10000;
                  totalAgr = resp.length - limitar;
                  agrupado = {nombre: (!this.parGrafica.agrupar_texto || this.parGrafica.agrupar_texto.length==0 ? this.servicio.rTraduccion()[2790] : this.parGrafica.agrupar_texto) + " (" + totalAgr + ")", paros_m: faltante1, produccion_m: faltante3, piezas_m: faltante2, calidad_m: faltante5, rechazos_m: faltante4, disponible_m: faltante6, ftq: miFTQ, efi: miEFI, dis: miDIS, oee: miOEE }
                }
              }
              resp.splice(limitar);
              if (this.parGrafica.agrupar == "S")
              {
                if (this.parGrafica.agrupar_posicion == "P")
                {
                  resp.unshift(agrupado);
                }
                else 
                {
                  resp.push(agrupado);
                  if (this.parGrafica.agrupar_posicion == "N")
                  {
                    //Se vuelve a ordenar
                    if (this.parGrafica.orden_grafica)
                    {
                      if (this.parGrafica.orden_grafica == "A")
                      {
                        resp.sort(this.ordenarALF(this.variable_2, 1))
                      }
                      else if (this.parGrafica.orden_grafica == "N")
                      {
                        resp.sort(this.ordenarNum(this.variable_2, 1))
                      }
                      else
                      {
                        resp.sort(this.ordenarNum(this.variable_2, -1))
                      }
                    }
                    else
                    {
                      resp.sort(this.ordenarNum(this.variable_2, 1))
                    }
                  }
                }
              }
              
            }

            //Calcular el maxmin de la grafica

            let valmax = 0;
            let valmax2 = "0";
            let acumulado = 0;
            if (this.grActual != 4)
            {
              for (var i = 0; i < resp.length; i++)
              {
                acumulado = acumulado + +resp[i][this.variable_2];
                if (+resp[i][this.variable_2] > valmax)
                {
                  valmax = +resp[i][this.variable_2];                    
                }
              }
              if (acumulado > 0)
              {
                let porcentaje = 0;
                for (var i = 0; i < resp.length; i++)
                {
                  porcentaje = porcentaje + +resp[i][this.variable_2]; 
                  resp[i].porcentaje = porcentaje / acumulado * 100;
                }
                resp[resp.length - 1].porcentaje = 100;
              }
  
              if (this.resumenes.length > 0)
              {
                for (var i = 0; i < this.resumenes.length; i++)
                {
                  if (+this.resumenes[i][this.variable_2] > valmax)
                  {
                    valmax = +this.resumenes[i][this.variable_2];                    
                  }
                }
              }

              acumulado = 0;
              for (var i = 0; i < this.miGraficaTotal.length; i++)
              {
                if (!this.miGraficaTotal[i].pareto)
                {
                  acumulado = acumulado + +this.miGraficaTotal[i][this.variable_2];
                }
                
              }
              if (acumulado > 0)
              {
                let porcentaje = 0;
                for (var i = 0; i < this.miGraficaTotal.length; i++)
                {
                  if (!this.miGraficaTotal[i].pareto)
                  {
                    porcentaje = porcentaje + +this.miGraficaTotal[i][this.variable_2]; 
                    this.miGraficaTotal[i].porcentaje = porcentaje / acumulado * 100;
                  }
                  
                }
                this.miGraficaTotal[this.miGraficaTotal.length - 1].porcentaje = 100;
              }

              
            }
            else
            {
              for (var i = 0; i < resp.length; i++)
              {
                if (+resp[i].oee > valmax)
                {
                  valmax = +resp[i].oee;
                }
                if (this.parGrafica.oee[0]=="S" && +resp[i].ftq > valmax)
                {
                  valmax = +resp[i].ftq;
                }
                if (this.parGrafica.oee[2]=="S" && +resp[i].dis > valmax)
                {
                  valmax = +resp[i].dis;
                }
                if (this.parGrafica.oee[1]=="S" && +resp[i].efi > valmax)
                {
                  valmax = +resp[i].efi;
                }
                
              }
              if (this.resumenes.length > 0)
              {
                for (var i = 0; i < this.resumenes.length; i++)
                {
                  if (+this.resumenes[i].oee > valmax)
                  {
                    valmax = +this.resumenes[i].oee;                    
                  }
                  if (this.parGrafica.oee[0]=="S" && +this.resumenes[i].ftq > valmax)
                  {
                    valmax = +this.resumenes[i].ftq;
                  }
                  if (this.parGrafica.oee[2]=="S" && +this.resumenes[i].dis > valmax)
                  {
                    valmax = +this.resumenes[i].dis;
                  }
                  if (this.parGrafica.oee[1]=="S" && +this.resumenes[i].efi > valmax)
                  {
                    valmax = +this.resumenes[i].efi;
                  }
                }
              }
            }
            if (this.grActual == 3 || this.grActual > 4)
            {
              this.parGrafica.adic21 = this.detalle.texto_y2;
              this.parGrafica.texto_y2 = this.detalle.texto_y2;
            }
            else
            {
              this.parGrafica.texto_y2 = this.detalle.texto_y2;
            }
            valmax2 = valmax.toString();
            this.maxmin = {startValue: 0, endValue: valmax };
            this.maxmin_o = {startValue: 0, endValue: +valmax2 };
            
            if (this.resumenes.length > 0 && (this.grActual <= 2 || this.grActual == 4))
            {
              this.formatoGrafico.precision = !this.parGrafica.etiqueta_formato ? 0 : +this.parGrafica.etiqueta_formato;
              this.miGrafica = this.resumenes.concat(resp);
              
            }
            else
            {
                this.formatoGrafico.precision = !this.parGrafica.etiqueta_formato ? 0 : +this.parGrafica.etiqueta_formato;
                this.miGrafica = resp;
            }
          }
          else
          {
            this.servicio.activarSpinnerSmall.emit(false);
            this.servicio.activarSpinner.emit(false);
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2668]
            mensajeCompleto.tiempo = 1000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          this.modelo = 1;
        })
    })
  }

 
  ordenarNum(campo: string, orden: number) 
  {
    
    let propiedad = campo;
    let sortOrder = orden;
    return function (a,b) 
    {
      let result = (+a[propiedad] < +b[propiedad]) ? -1 : (+a[propiedad] > +b[propiedad]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  ordenarALF(campo: string, orden: number) 
  {
    let propiedad = campo;
    let sortOrder = 1;
    return function (a,b) 
    {
      let result = (a[propiedad] < b[propiedad]) ? -1 : (a[propiedad] > b[propiedad]) ? 1 : 0;
      return result * sortOrder;
    }
  }

filtrar()
{
  this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2791]);
  this.listarConsultas()
  this.filtrando = true;
  this.formateando = false;
  this.filtrarC = false;
  this.graficando = false;
  this.bot4Sel = false;
  this.bot7Sel = false;
  this.guardarSel = false;
  this.modelo = 12;
  this.buscarConsulta(this.servicio.rConsulta());
}

buscarConsulta(id: number)
{
  this.botElim = false;
  this.botGuar = false;
  this.botCan = false;
  this.consultaTemp = '' + id;
  this.listarLineas();
  this.listarMaquinas();
  this.listarAreas();
  this.listarResponsables();
  this.listarFallas();
  this.listarTecnicos();
  this.listarPartes();
  this.listarTurnos();
  this.listarLotes();
  this.listarParos();
  this.listarProcesos();
  let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".consultas_cab WHERE id = " + id;
  let campos = {accion: 100, sentencia: sentencia};  
  this.servicio.consultasBD(campos).subscribe( resp =>
  {
    if (resp.length > 0)
    { 
      if (!resp[0].filtroori)
      {
        resp[0].filtroori = "N";
      }
      if (!resp[0].nombre)
      {
        this.botElim = false;  
      }     
      else if (resp[0].nombre == "")
      {
        this.botElim = false;  
      }
      else if (resp[0].usuario != + this.servicio.rUsuario().id)
      {
        this.botElim = false;  
      }
      else
      {
        this.botElim = true;
      }
      this.consultaBuscada = false;
      resp[0].filtroclase = resp[0].filtrocla == "SNNNNN" ? "S" : "N"
      this.detalle = resp[0]; 
      this.detalle.periodo = +this.detalle.periodo;
      if (this.detalle.periodo==8)
      {
        this.detalle.desde = new Date(this.detalle.desde);
        this.detalle.hasta = new Date(this.detalle.hasta);
      }
      this.detalle.filtrolin = !this.detalle.filtrolin ? "S" : this.detalle.filtrolin;
      this.detalle.filtroori = !this.detalle.filtroori ? "S" : this.detalle.filtroori;
      this.detalle.filtromaq = !this.detalle.filtromaq ? "S" : this.detalle.filtromaq;
      this.detalle.filtroare = !this.detalle.filtroare ? "S" : this.detalle.filtroare;
      this.detalle.filtrofal = !this.detalle.filtrofal ? "S" : this.detalle.filtrofal;
      this.detalle.filtrotec = !this.detalle.filtrotec ? "S" : this.detalle.filtrotec;
      this.detalle.filtronpar = !this.detalle.filtronpar ? "S" : this.detalle.filtronpar;
      this.detalle.filtrooper = !this.detalle.filtrooper ? "S" : this.detalle.filtrooper;
      this.detalle.filtrotur = !this.detalle.filtrotur ? "S" : this.detalle.filtrotur;
      this.detalle.filtroord = !this.detalle.filtroord ? "S" : this.detalle.filtroord;      
      this.detalle.filtropar = !this.detalle.filtropar ? "S" : this.detalle.filtropar;  
      this.detalle.filtrocla = !this.detalle.filtrocla ? "SNNNNN" : this.detalle.filtrocla;    
      this.detalle.filtroclase = this.detalle.filtrocla == "SNNNNN" ? "S" : "N";

    }
    else
    {
      this.detalle.nombre = "";
      this.detalle.defecto = "N";
      this.detalle.id = "0";
      this.detalle.periodo = 1;
      this.detalle.publico = "N";
      this.detalle.desde = "";
      this.detalle.hasta = "";
      this.detalle.filtrolin = "S";
      this.detalle.filtroori = "S";
      this.detalle.filtromaq = "S";
      this.detalle.filtroare = "S";
      this.detalle.filtrofal = "S";
      this.detalle.filtrotec = "S";
      this.detalle.filtronpar = "S";
      this.detalle.filtrotur = "S";
      this.detalle.filtroord = "S";      
      this.detalle.filtropar = "S";  
      this.detalle.filtrocla = "SNNNNN";    
      this.detalle.filtroclase ="S";
      this.detalle.filtrooper = "S";

      this.consultaBuscada = false; 
    }
    this.detalle.selMaquinasT = "S";
    this.detalle.selFallasT = "S";
    this.detalle.selTurnosT = "S";
    this.detalle.selLotesT = "S";
    this.detalle.selLineasT = "S";
    this.detalle.selAreasT = "S";
    this.detalle.selPartesT = "S";
    this.detalle.selTecnicosT = "S";
    this.detalle.selProcesosT = "S";
    this.detalle.selParosT = "S";
    setTimeout(() => {
      this.txtNombre.nativeElement.focus();  
    }, 200);
  }, 
  error => 
    {
      console.log(error)
    })
}


buscarConsultaID()
{
  let sentencia = "SELECT id FROM " + this.servicio.rBD() + ".consultas_cab WHERE (usuario = " + this.servicio.rUsuario().id + ") AND nombre = '" + this.detalle.nombre + "'";
  let campos = {accion: 100, sentencia: sentencia};  
  this.servicio.consultasBD(campos).subscribe( resp =>
  {
    if (resp.length > 0)
    {
      this.detalle.id = resp[0].id  
    }
    else
    {
      this.detalle.id = 0; 
    }
    this.guardar(1)
  })
}

regresar()
{
  this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2173]);
  this.modelo = 11;
  this.graficando = true;
  this.filtrando = false;
  this.formateando = false;

}


listarConsultas()
  {
    let sentencia = "SELECT id, nombre, general, usuario FROM " + this.servicio.rBD() + ".consultas_cab WHERE (usuario = " + this.servicio.rUsuario().id + ") OR (general = 'S' AND NOT ISNULL(nombre)) ORDER BY nombre;";
    this.consultas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      for (var i = 0; i < resp.length; i++) 
      {
        if (!resp[i].nombre)
        {
          resp[i].nombre = " [" + this.servicio.rTraduccion()[2032] + "]";
        }
        else if (resp[i].nombre == "")
        {
          resp[i].nombre = " [" + this.servicio.rTraduccion()[2032] + "]";
        }
      }
      this.consultas = resp;
    });
  }

   cConsulta(event: any) 
  {
    this.eliminar = event.value != 0;
    this.buscarConsulta(event.value);
  }

  eliminarConsulta()
  {
    this.bot7Sel = false;
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[2033], mensaje: this.servicio.rTraduccion()[2034], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[1981], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_eliminar" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result.accion)
      {
        if (result.accion == 1) 
        {
          let sentencia = "DELETE FROM " + this.servicio.rBD() + ".consultas_cab WHERE id = " + this.detalle.id + ";DELETE FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.detalle.id + ";"
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe(resp =>
          {
            if (this.servicio.rConsulta() == this.detalle.id)
            {
              this.servicio.aConsulta(0);
            }
            this.botElim = false;
            this.detalle.id = 0;
            this.detalle.nombre = "";
            this.detalle.defecto = "N";
            this.detalle.id = "0";
            this.detalle.periodo = 1;
            this.detalle.publico = "N";
            this.detalle.desde = "";
            this.detalle.hasta = "";
            this.detalle.filtrolin = "S";
            this.detalle.filtroori = "S";
            this.detalle.filtromaq = "S";
            this.detalle.filtroare = "S";
            this.detalle.filtrofal = "S";
            this.detalle.filtrotec = "S";
            this.detalle.filtronpar = "S";
            this.detalle.filtrotur = "S";
            this.detalle.filtroord = "S";
            this.detalle.filtropar = "S";
            this.detalle.filtrocla = "SNNNNN";   
            this.detalle.filtroclase ="S";   
            this.detalle.filtrooper = "S";
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2008]
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            setTimeout(() => {
              this.txtNombre.nativeElement.focus();  
            }, 200);
          });
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381]
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
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

  listarLineas()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_lineas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 10 AND b.consulta = " + this.consultaTemp + " ORDER BY seleccionado DESC, a.nombre;"
    this.lineas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        setTimeout(() => {
          this.lineas = resp;
        }, 300);
      
    });
  }

  listarMaquinas()
  {
    let sentencia = "SELECT a.id, CASE WHEN ISNULL(c.nombre) THEN a.nombre ELSE CONCAT(a.nombre, ' / ',  c.nombre) END AS nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 20 AND b.consulta = " + this.consultaTemp + " LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id ORDER BY seleccionado DESC, nombre;"
    this.maquinas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        setTimeout(() => {
          this.maquinas = resp;
        }, 300);
    });
  }

  listarPartes()
  {
    let sentencia = "SELECT a.id, CASE WHEN ISNULL(a.referencia) THEN a.nombre ELSE CONCAT(a.nombre, '" + this.servicio.rTraduccion()[2637] + "', a.referencia, ')') END AS nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_partes a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 60 AND b.consulta = " + this.consultaTemp + " WHERE a.tipo = 0 ORDER BY seleccionado DESC, nombre;"
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.partes = resp;
      }, 300);
    });
  }

  listarTurnos()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_turnos a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 70 AND b.consulta = " + this.consultaTemp + " ORDER BY seleccionado DESC, a.nombre;"
    this.turnos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.turnos = resp;
      }, 300);
    });
  }

  listarProcesos()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 90 AND b.consulta = " + this.consultaTemp + " WHERE  a.kanban = 'S' ORDER BY seleccionado DESC, a.nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.procesos = resp;
      }, 300);
    });
  }


  listarLotes()
  {
    let sentencia = "SELECT a.id, CASE WHEN ISNULL(c.nombre) THEN a.numero ELSE CONCAT(a.numero, ' / ', c.nombre) END AS nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 80 AND b.consulta = " + this.consultaTemp + " WHERE a.estatus = 'A' AND a.creacion >= DATE_ADD(NOW(), INTERVAL -12 MONTH) ORDER BY seleccionado DESC, nombre;"
    this.lotes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.lotes = resp;
      }, 300);
    });
  }
  

  listarParos()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_generales a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 100 AND b.consulta = " + this.consultaTemp + " WHERE a.tabla = 45 ORDER BY seleccionado DESC, a.nombre;"
    
    if (this.grActual == 6)
    {
      sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_generales a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 120 AND b.consulta = " + this.consultaTemp + " WHERE a.tabla = 105 ORDER BY seleccionado DESC, a.nombre;"
    
    }
    this.paros = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        setTimeout(() => {
          this.paros = resp;
        }, 300);
    });
  }

  listarAreas()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_areas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 30 AND b.consulta = " + this.consultaTemp + " ORDER BY seleccionado DESC, a.nombre;"
    this.areas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.areas = resp;
      }, 300);
    });
  }


  listarResponsables()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_generales a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 30 AND b.consulta = " + this.consultaTemp + " WHERE a.tabla = " + (this.grActual == 5 ? "145" : "140") + " ORDER BY seleccionado DESC, a.nombre;"
    this.responsables = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.responsables = resp;
      }, 300);
    });
  }

  listarFallas()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_fallas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 40 AND b.consulta = " + this.consultaTemp + " ORDER BY seleccionado DESC, a.nombre;"
    this.fallas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
          setTimeout(() => {
            this.fallas = resp;
          }, 300);
      
    });
  }

  listarTecnicos()
  {
    let cadAdicional = "";
    if (this.grActual >= 7)
    {
      cadAdicional = "OR a.rol = 'M'"
    }
    else
    {
      cadAdicional = "OR a.rol = 'T'"
    }
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_usuarios a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 50 AND b.consulta = " + this.consultaTemp + " WHERE (a.rol = 'A'" + cadAdicional + ") ORDER BY seleccionado DESC, a.nombre;"
    this.tecnicos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
          setTimeout(() => {
            this.tecnicos = resp;
          }, 300);
      
    });
  }

  cancelar()
  {
    this.bot4Sel = false;
    this.eliminar = this.detalle.id != 0;
    this.buscarConsulta(this.detalle.id);
  }

  seleccion(tipo: number, event: any) 
  {
    this.botGuar = true;
    this.botCan = true;
    if (tipo == 1)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.lineas.length; i++) 
        {
          this.lineas[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtrolin = "N";  
        }, 100);
      }
    }
    else if (tipo == 2)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.maquinas.length; i++) 
        {
          this.maquinas[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtromaq = "N";  
        }, 100);
      }
    }
    else if (tipo == 3)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.areas.length; i++) 
        {
          this.areas[i].seleccionado = event.value==1;
        }
        setTimeout(() => {
          this.detalle.filtroare = "N";  
        }, 100);
      }
    }
    else if (tipo == 4)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.fallas.length; i++) 
        {
          this.fallas[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtrofal = "N";  
        }, 100);
      }
    }
    else if (tipo == 5)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.tecnicos.length; i++) 
        {
          this.tecnicos[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtrotec = "N";  
        }, 100);
      }
    }

    else if (tipo == 7)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.partes.length; i++) 
        {
          this.partes[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtronpar = "N";  
        }, 100);
      }
    }
    else if (tipo == 6)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.turnos.length; i++) 
        {
          this.turnos[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtrotur = "N";   
        }, 100);
      }
    }
    else if (tipo == 8)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.lotes.length; i++) 
        {
          this.lotes[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtroord = "N";   
        }, 100);
      }
    }
    else if (tipo == 9)
    {
      if (event.value <= 1) 
      {
        for (var i = 0; i < this.paros.length; i++) 
        {
          this.paros[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtropar = "N";   
        }, 100);
      }
    }
    else if (tipo == 10)
    {
      if (event.value <= 1) 
      {
        for (var i = 1; i == 5; i++) 
        {
          this.detalle.filtrocla[i] = event.value == 1 ? "S" : "N";
        }
        setTimeout(() => {
          this.detalle.filtroclase = "N";   
        }, 100);
      }
    }
  }

  guardar(id: number)
  {
    this.guardarSel = false;
    let errores = 0;
    this.error01 = false;
    this.error02 = false;
    this.error03 = false;
    this.error04 = false;
    this.faltaMensaje = this.servicio.rTraduccion()[127];
    if (!this.detalle.nombre && id == 1)
    {
        errores = errores + 1;
        this.error01 = true;
        this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[2172];      
    }
    else if ((!this.detalle.nombre || this.detalle.nombre=="") && id == 1)
    {
        errores = errores + 1;
        this.error01 = true;
        this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[2172];      
    }
    if (this.detalle.periodo == "8")
    {
      if (!this.detalle.desde) 
      {
        errores = errores + 1;
          this.error02 = true;
          this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[1480];      
      }

      if (!this.detalle.hasta) 
      {
        errores = errores + 1;
          this.error03 = true;
          this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[1479];      
      }


      if (this.detalle.desde && this.detalle.hasta) 
      {
        if (this.detalle.desde > this.detalle.hasta)
        {
          errores = errores + 1;
          this.error04 = true;
          this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[1481]
        }
      }
    
      
    }
    
  if (id== 1 && !this.consultaBuscada)
    {
      this.consultaBuscada = true;
      this.buscarConsultaID();
      return;
    }
    this.consultaBuscada = false;
    if (errores > 0)
    {
      setTimeout(() => {
        if (this.error01)
        {
          this.txtNombre.nativeElement.focus();
        }
        else if (this.error02)
        {
          this.txtDesde.nativeElement.focus();
        }
        else if (this.error03)
        {
          this.txtHasta.nativeElement.focus();
        }
      }, 300);
      return;
    }
    this.editando = false;
    this.faltaMensaje = "";
    if (id == 0 && !this.detalle.nombre)
    {
      this.detalle.publico = "N";
    }

    this.botGuar = false;
    this.botCan = false;
    
    
    if (this.listaClases)
    {
      let fc0 = "N";
      let fc1 = "N";
      let fc2 = "N";
      let fc3 = "N";
      let fc4 = "N";
      let fc5 = "N";
      for (var i = 0; i < this.listaClases.selectedOptions.selected.length; i++) 
      {
        if (this.listaClases.selectedOptions.selected[i].value==0)
        {
          fc1 = "S";
        }
        else if (this.listaClases.selectedOptions.selected[i].value==1)
        {
          fc2 = "S";
        }
        else if (this.listaClases.selectedOptions.selected[i].value==2)
        {
          fc3 = "S";
        }
        else if (this.listaClases.selectedOptions.selected[i].value==3)
        {
          fc4 = "S";
        }
        else if (this.listaClases.selectedOptions.selected[i].value==4)
        {
          fc5 = "S";
        }
      }
      if (this.detalle.filtroclase == "S")
      {
        fc0 = "S"
      }
      this.detalle.filtrocla = fc0 + fc1 + fc2 + fc3 + fc4 + fc5;

    }
    
    let previa = "";
    if (!this.detalle.nombre)
    {
      previa = "DELETE FROM " + this.servicio.rBD() + ".consultas_cab WHERE (ISNULL(nombre) OR nombre = '') AND usuario = " + this.servicio.rUsuario().id + ";";
    }
    let previa2 = "";
    if (this.detalle.defecto == "S")
    {
      previa2 = "UPDATE " + this.servicio.rBD() + ".consultas_cab SET defecto = 'N', actualizacion = NOW() WHERE usuario = " + this.servicio.rUsuario().id + ";";
    }
    let nuevo = true
    let sentencia = previa + previa2 + "INSERT INTO " + this.servicio.rBD() + ".consultas_cab (usuario, " + (id == 1 ? "nombre, " : "") + "publico, periodo, defecto, filtrolin, filtroori, filtromaq, filtroare, filtrofal, filtrotec, filtronpar, filtrotur, filtroord, filtrooper, filtropar, filtrocla" + (this.detalle.periodo != 8 ? "" : ", desde, hasta") + ", actualizacion) VALUES (" + this.servicio.rUsuario().id + ", '" + (id == 1 ? this.detalle.nombre + "', '" : "") + this.detalle.publico + "', '" + this.detalle.periodo + "', '" + this.detalle.defecto + "', '" + this.detalle.filtrolin + "', '" + this.detalle.filtroori + "', '" + this.detalle.filtromaq + "', '" + this.detalle.filtroare + "', '" + this.detalle.filtrofal + "', '" + this.detalle.filtrotec + "', '" + this.detalle.filtronpar + "', '" + this.detalle.filtrotur + "', '" + this.detalle.filtroord + "', '" + this.detalle.filtrooper + "', '" + this.detalle.filtropar + "', '" + this.detalle.filtrocla + "'" + (this.detalle.periodo != 8 ? "" : ", '" + this.servicio.fecha(2, this.detalle.desde, "yyyy/MM/dd") + "', '" +  this.servicio.fecha(2, this.detalle.hasta, "yyyy/MM/dd") + "'") + ", NOW());"
    if (+this.detalle.id > 0)
    {
      nuevo = false;
      sentencia = previa2 + "UPDATE " + this.servicio.rBD() + ".consultas_cab SET " + (id == 1 ? "nombre = '" + this.detalle.nombre + "', " : "") + "actualizacion = NOW(), publico = '" + this.detalle.publico + "', periodo = '" + this.detalle.periodo + "', defecto = '" + this.detalle.defecto + "', filtrolin = '" + this.detalle.filtrolin + "', filtroori = '" + this.detalle.filtroori + "', filtromaq = '" + this.detalle.filtromaq + "', filtroare = '" + this.detalle.filtroare + "', filtrofal = '" + this.detalle.filtrofal + "', filtrotec = '" + this.detalle.filtrotec + "', filtronpar = '" + this.detalle.filtronpar + "', filtrotur = '" + this.detalle.filtrotur + "', filtroord = '" + this.detalle.filtroord + "', filtrooper = '" + this.detalle.filtrooper + "', filtropar = '" + this.detalle.filtropar + "', filtrocla = '" + this.detalle.filtrocla + "'" + (this.detalle.periodo != 8 ? "" : ", desde = '" + this.servicio.fecha(2, this.detalle.desde, "yyyy/MM/dd") + "', hasta = '" +  this.servicio.fecha(2, this.detalle.hasta, "yyyy/MM/dd") + "' ") + " WHERE id = " + +this.detalle.id + ";";
    }
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (nuevo)
      {
        sentencia = "SELECT MAX(id) AS nuevoid FROM " + this.servicio.rBD() + ".consultas_cab;";
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          this.detalle.id = resp[0].nuevoid
          this.guardar_2(id);
          if (this.detalle.defecto == "S")
          {
            this.servicio.aConsulta(this.detalle.id);
          }
          setTimeout(() => {
            this.txtNombre.nativeElement.focus();  
          }, 200);
        })
      }
      else
      {
        this.guardar_2(id);
      }
    })
  }

  guardar_2(id: number)
  {
    let sentencia = "DELETE FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + +this.detalle.id + ";";
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      let cadTablas = "INSERT INTO " + this.servicio.rBD() + ".consultas_det (consulta, tabla, valor) VALUES";
      if (this.listaLineas)
      {
        for (var i = 0; i < this.listaLineas.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 10,  " + +this.listaLineas.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 10,  " + +this.listaLineas.selectedOptions.selected[i].value + "),";
          }
        }
      }
      if (this.listaMaquinas)
      {
        for (var i = 0; i < this.listaMaquinas.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 20,  " + +this.listaMaquinas.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 20,  " + +this.listaMaquinas.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaAreas)
      {
        for (var i = 0; i < this.listaAreas.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 30,  " + +this.listaAreas.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 30,  " + +this.listaAreas.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaFallas)
      {
        for (var i = 0; i < this.listaFallas.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 40,  " + +this.listaFallas.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 40,  " + +this.listaFallas.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaResponsables)
      {
        for (var i = 0; i < this.listaResponsables.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 30,  " + this.listaResponsables.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 30,  " + this.listaResponsables.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      
      if (this.listaTecnicos)
      {
        for (var i = 0; i < this.listaTecnicos.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 50,  " + +this.listaTecnicos.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 50,  " + +this.listaTecnicos.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaPartes)
      {
        for (var i = 0; i < this.listaPartes.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 60,  " + +this.listaPartes.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 60,  " + +this.listaPartes.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaTurnos)
      {
        for (var i = 0; i < this.listaTurnos.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 70,  " + +this.listaTurnos.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 70,  " + +this.listaTurnos.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaLotes)
      {
        for (var i = 0; i < this.listaLotes.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 80,  " + +this.listaLotes.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 80,  " + +this.listaLotes.selectedOptions.selected[i].value + "),";
          }
          
        }
      }
      if (this.listaParos)
      {
        if (this.grActual == 5)
        {
          for (var i = 0; i < this.listaParos.selectedOptions.selected.length; i++) 
          {
            if (cadTablas.indexOf("(" + this.detalle.id + ", 100,  " + this.listaParos.selectedOptions.selected[i].value + ")") == -1)
            {
              cadTablas = cadTablas + "(" + this.detalle.id + ", 100,  " + this.listaParos.selectedOptions.selected[i].value + "),";
            }
          }
        }
        else if (this.grActual == 6)
        {
          for (var i = 0; i < this.listaParos.selectedOptions.selected.length; i++) 
          {
            if (cadTablas.indexOf("(" + this.detalle.id + ", 120,  " + this.listaParos.selectedOptions.selected[i].value + ")") == -1)
              {
                cadTablas = cadTablas + "(" + this.detalle.id + ", 120,  " + this.listaParos.selectedOptions.selected[i].value + "),";
              }
            
          }
        }
        
      }
      if (cadTablas != "INSERT INTO " + this.servicio.rBD() + ".consultas_det (consulta, tabla, valor) VALUES")
      {
        cadTablas = cadTablas.substr(0, cadTablas.length - 1);
        let campos = {accion: 200, sentencia: cadTablas};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (id == 0)
          {
            this.modelo = 11;
            this.servicio.aConsulta(this.detalle.id);
            this.graficando = true;
            this.filtrando = false;
            this.formateando = false;
            this.aplicarConsulta(-1);
            
          }
        });
      }
      else
      {
        if (id == 0)
        {
          this.modelo = 11;
          this.servicio.aConsulta(this.detalle.id);
          this.graficando = true;
          this.filtrando = false;
          this.formateando = false;
          this.aplicarConsulta(-1);
          
        }
      }
      
    })
    this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2173]);
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "snack-normal";
    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2009]
    mensajeCompleto.tiempo = 2000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
  }

  guardarF(id: number)
  {
    this.detalle.color_letras = this.detalle.color_letras ? this.detalle.color_letras.substr(1) : "";
    this.detalle.etiqueta_color = this.detalle.etiqueta_color ? this.detalle.etiqueta_color.substr(1) : "";
    this.detalle.etiqueta_fondo = this.detalle.etiqueta_fondo ? this.detalle.etiqueta_fondo.substr(1) : "";
    this.detalle.etiqueta_formato = !this.detalle.etiqueta_formato ? 0 : this.detalle.etiqueta_formato
    this.detalle.color_leyenda = this.detalle.color_leyenda ? this.detalle.color_leyenda.substr(1) : "";
    this.detalle.color_leyenda_fondo = this.detalle.color_leyenda_fondo ? this.detalle.color_leyenda_fondo.substr(1) : "";
    this.detalle.color_fondo_barras = this.detalle.color_fondo_barras ? this.detalle.color_fondo_barras.substr(1) : "";
    this.detalle.color_fondo = this.detalle.color_fondo ? this.detalle.color_fondo.substr(1) : "";
    this.detalle.color_barra = this.detalle.color_barra ? this.detalle.color_barra.substr(1) : "";

    this.detalle.oee_colores = (this.detalle.colorFTQ ? this.detalle.colorFTQ.substr(1) : "") + ";" + (this.detalle.colorEFI ? this.detalle.colorEFI.substr(1) : "") + ";" + (this.detalle.colorDIS ? this.detalle.colorDIS.substr(1) : "");
    
    this.detalle.color_barra_borde = this.detalle.color_barra_borde ? this.detalle.color_barra_borde.substr(1) : "";
    this.detalle.color_spiline = this.detalle.color_spiline ? this.detalle.color_spiline.substr(1) : "";
    this.detalle.color_esperado = this.detalle.color_esperado ? this.detalle.color_esperado.substr(1) : "";
    this.detalle.titulo_fuente = (!this.detalle.titulo_fuente) ? 20 : this.detalle.titulo_fuente > 99 ? 99 : this.detalle.titulo_fuente;
    this.detalle.subtitulo_fuente = (!this.detalle.subtitulo_fuente) ? 15 : this.detalle.subtitulo_fuente > 99 ? 99 : this.detalle.subtitulo_fuente;
    this.detalle.texto_x_fuente = (!this.detalle.texto_x_fuente) ? 10 : this.detalle.texto_x_fuente > 99 ? 99 : this.detalle.texto_x_fuente;
    this.detalle.texto_y_fuente = (!this.detalle.texto_y_fuente) ? 10 : this.detalle.texto_y_fuente > 99 ? 99 : this.detalle.texto_y_fuente;
    this.detalle.texto_z_fuente = (!this.detalle.texto_z_fuente) ? 10 : this.detalle.texto_z_fuente > 99 ? 99 : this.detalle.texto_z_fuente;
    this.detalle.etiqueta_fuente = (!this.detalle.etiqueta_fuente) ? 10 : this.detalle.etiqueta_fuente > 99 ? 99 : this.detalle.etiqueta_fuente;
    this.detalle.alto = (!this.detalle.alto) ? 0 : this.detalle.alto > 999999 ? 999999 : this.detalle.alto;
    this.detalle.ancho = (!this.detalle.ancho) ? 0 : this.detalle.ancho > 999999 ? 999999 : this.detalle.ancho;
    this.detalle.margen_arriba = (!this.detalle.margen_arriba) ? 0 : this.detalle.margen_arriba > 99 ? 99 : this.detalle.margen_arriba;
    this.detalle.margen_abajo = (!this.detalle.margen_abajo) ? 0 : this.detalle.margen_abajo > 99 ? 99 : this.detalle.margen_abajo;

    this.detalle.subtitulo = !this.detalle.subtitulo ? "" : this.detalle.subtitulo;
    this.detalle.subtitulo = this.detalle.subtitulo == "null" ? "" : this.detalle.subtitulo;
    this.detalle.etiqueta_leyenda = !this.detalle.etiqueta_leyenda ? "" : this.detalle.etiqueta_leyenda;
    this.detalle.etiqueta_leyenda = this.detalle.etiqueta_leyenda == "null" ? "" : this.detalle.etiqueta_leyenda;


    this.detalle.tadic1 = !this.detalle.tadic1 ? "" : this.detalle.tadic1;
    this.detalle.tadic2 = !this.detalle.tadic2 ? "" : this.detalle.tadic2;
    this.detalle.tadic3 = !this.detalle.tadic3 ? "" : this.detalle.tadic3;
    this.detalle.tadic4 = !this.detalle.tadic4 ? "" : this.detalle.tadic4;
    this.detalle.tadic5 = !this.detalle.tadic5 ? "" : this.detalle.tadic5;
    this.detalle.tadic6 = !this.detalle.tadic6 ? "" : this.detalle.tadic6;
    this.detalle.adic1 = !this.detalle.adic1 ? "0" : this.detalle.adic1;
    this.detalle.adic2 = !this.detalle.adic2 ? "0" : this.detalle.adic2;
    this.detalle.adic3 = !this.detalle.adic3 ? "0" : this.detalle.adic3;
    this.detalle.adic4 = !this.detalle.adic4 ? "0" : this.detalle.adic4;
    this.detalle.adic5 = !this.detalle.adic5 ? "0" : this.detalle.adic5;
    this.detalle.adic6 = !this.detalle.adic6 ? "0" : this.detalle.adic6;

    this.detalle.coladic1 = this.detalle.coladic1 ? this.detalle.coladic1.substr(1) : "";
    this.detalle.coladic2 = this.detalle.coladic2 ? this.detalle.coladic2.substr(1) : "";
    this.detalle.coladic3 = this.detalle.coladic3 ? this.detalle.coladic3.substr(1) : "";
    this.detalle.coladic4 = this.detalle.coladic4 ? this.detalle.coladic4.substr(1) : "";
    this.detalle.coladic5 = this.detalle.coladic5 ? this.detalle.coladic5.substr(1) : "";
    this.detalle.coladic6 = this.detalle.coladic6 ? this.detalle.coladic6.substr(1) : "";
    
    this.detalle.color_alto = this.detalle.color_alto ? this.detalle.color_alto.substr(1) : "";
    this.detalle.color_bajo = this.detalle.color_bajo ? this.detalle.color_bajo.substr(1) : "";

    this.detalle.margen_izquierda = (!this.detalle.margen_izquierda) ? 0 : this.detalle.margen_izquierda > 99 ? 99 : this.detalle.margen_izquierda;
    this.detalle.margen_derecha = (!this.detalle.margen_derecha) ? 0 : this.detalle.margen_derecha > 99 ? 99 : this.detalle.margen_derecha;
    this.detalle.grueso_esperado = (!this.detalle.grueso_esperado) ? 1 : this.detalle.grueso_esperado > 10 ? 10 : this.detalle.grueso_esperado;
    this.detalle.grueso_spiline = (!this.detalle.grueso_spiline) ? 1 : this.detalle.grueso_spiline > 10 ? 10 : this.detalle.grueso_spiline;
    this.detalle.maximo_barras = (!this.detalle.maximo_barras) ? 0 : this.detalle.maximo_barras > 100 ? 100 : this.detalle.maximo_barras;
    this.detalle.maximo_barraspct = (!this.detalle.maximo_barraspct) ? 0 : this.detalle.maximo_barraspct > 99 ? 99 : this.detalle.maximo_barraspct;
    this.detalle.valor_esperado = (!this.detalle.valor_esperado) ? 0 : this.detalle.valor_esperado;
    
    let cadOEE = "NNNNNN";

    this.detalle.oee_tipo = this.detalle.oee_tipoFTQ + this.detalle.oee_tipoEFI + this.detalle.oee_tipoDIS

    this.detalle.oee_nombre = this.detalle.oee_nombreFTQ + ";" + this.detalle.oee_nombreEFI + ";" + this.detalle.oee_nombreDIS;
    this.detalle.adicionales_titulos = this.detalle.tadic1 + ";" +this.detalle.tadic2 + ";" +this.detalle.tadic3 + ";" +this.detalle.tadic4 + ";" +this.detalle.tadic5 + ";" +this.detalle.tadic6
    
    this.detalle.adicionales = this.detalle.adic1 + ";" +this.detalle.adic2 + ";" +this.detalle.adic3 + ";" +this.detalle.adic4 + ";" +this.detalle.adic5 + ";" +this.detalle.adic6 + ";" +this.detalle.adic7
    
    this.detalle.adicionales_colores = this.detalle.coladic1 + ";" +this.detalle.coladic2 + ";" +this.detalle.coladic3 + ";" +this.detalle.coladic4 + ";" +this.detalle.coladic5 + ";" +this.detalle.coladic6
  
    this.detalle.esperado_esquema = (!this.detalle.dividir_colores ? "N" : this.detalle.dividir_colores) + ";" + this.detalle.color_bajo + ";" + this.detalle.color_alto 

    cadOEE = (this.detalle.oee_selFTQ ? "S" : "N") + (this.detalle.oee_selEFI ? "S" : "N") + (this.detalle.oee_selDIS ? "S" : "N");
    cadOEE = cadOEE + (this.detalle.oee_etiFTQ ? this.detalle.oee_etiFTQ : "N");
    cadOEE = cadOEE + (this.detalle.oee_etiEFI ? this.detalle.oee_etiEFI : "N");
    cadOEE = cadOEE + (this.detalle.oee_etiDIS ? this.detalle.oee_etiDIS : "N");

    let sentencia = "SELECT id FROM " + this.servicio.rBD() + ".pu_graficos WHERE grafico = " + (this.grActual * 100 + this.graficaActual) +  " AND usuario = " + this.servicio.rUsuario().id + " AND idioma = " + this.servicio.rIdioma().id; 
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      let esNuevo = false;
      if (resp.length == 0)
      {
        esNuevo = true;
        sentencia = "INSERT INTO " + this.servicio.rBD() + ".pu_graficos (grafico, usuario, idioma) VALUES(" + (this.grActual * 100 + this.graficaActual) + ", " + this.servicio.rUsuario().id + ", " + this.servicio.rIdioma().id + ");"
      }
      else
      {
        sentencia = "";
      }
      let cadTextoY = "";
      if (this.detalle.texto_y)
      { 
        cadTextoY = this.detalle.texto_y.split(";");
      }
      if (cadTextoY.length == 1)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";;;";
        cadTextoY = this.detalle.texto_y.split(";");
      }
      else if (this.detalle.texto_y.length == 2)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";;";
        cadTextoY = this.detalle.texto_y.split(";");
      }
      else if (this.detalle.texto_y.length == 3)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";";
        cadTextoY = this.detalle.texto_y.split(";");
      } 
      this.detalle.texto_y2 = !this.detalle.texto_y2 ? "" :this.detalle.texto_y2;
      if (this.actualIndice == 0)
      {
        this.detalle.texto_y = this.detalle.texto_y2 + ";" + (cadTextoY[1] ? cadTextoY[1] : "")  + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 1)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + this.detalle.texto_y2 + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 2)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + (cadTextoY[1] ? cadTextoY[1] : "") + ";" + this.detalle.texto_y2 + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 3)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + (cadTextoY[1] ? cadTextoY[1] : "") + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + this.detalle.texto_y2
      }
      let adicional = this.detalle.adic21 + ";" + this.detalle.adic22
      adicional = !adicional ? ";" : adicional;


      sentencia = sentencia + "UPDATE " + this.servicio.rBD() + ".pu_graficos SET visualizar = '" + this.detalle.visualizar + "', titulo = '" + this.detalle.titulo + "', orden = '" + (!this.detalle.orden ? "1" : this.detalle.orden) + "', tipo_principal = '" + this.detalle.tipo_principal + "', oee_tipo = '" + this.detalle.oee_tipo + "', oee_nombre = '" + this.detalle.oee_nombre + "', oee = '" + cadOEE + "', oee_colores = '" + this.detalle.oee_colores + "', titulo_fuente = " + this.detalle.titulo_fuente + ", sub_titulo = '" + this.detalle.sub_titulo + "', subtitulo_fuente = " + this.detalle.subtitulo_fuente + ", texto_x = '" + this.detalle.texto_x + "', texto_x_fuente = " + this.detalle.texto_x_fuente + ", texto_y = '" + this.detalle.texto_y + "', texto_y_fuente = " + this.detalle.texto_y_fuente + ", texto_z = '" + this.detalle.texto_z + "', texto_z_fuente = " + this.detalle.texto_z_fuente + ", etiqueta_mostrar = '" + this.detalle.etiqueta_mostrar + "', etiqueta_fuente = " + this.detalle.etiqueta_fuente + ", etiqueta_leyenda = '" + this.detalle.etiqueta_leyenda + "', etiqueta_color = '" + this.detalle.etiqueta_color + "', etiqueta_fondo = '" + this.detalle.etiqueta_fondo + "', etiqueta_formato = " + +this.detalle.etiqueta_formato + ", ancho = " + this.detalle.ancho + ", alto = " + this.detalle.alto + ", margen_arriba = " + this.detalle.margen_arriba + ", margen_abajo = " + this.detalle.margen_abajo + ", margen_izquierda = " + this.detalle.margen_izquierda + ", margen_derecha = " + this.detalle.margen_derecha + ", maximo_barras = " + this.detalle.maximo_barras + ", maximo_barraspct = " + this.detalle.maximo_barraspct + ", agrupar = '" + this.detalle.agrupar + "', agrupar_posicion = '" + this.detalle.agrupar_posicion + "', agrupar_texto = '" + this.detalle.agrupar_texto + "', fecha = NOW(), color_fondo_barras = '" + this.detalle.color_fondo_barras + "', color_letras = '" + this.detalle.color_letras + "', color_fondo = '" + this.detalle.color_fondo + "', color_leyenda_fondo = '" + this.detalle.color_leyenda_fondo + "', color_leyenda = '" + this.detalle.color_leyenda + "', ver_esperado = '" + this.detalle.ver_esperado + "', valor_esperado = " + +this.detalle.valor_esperado + ", grueso_esperado = " + this.detalle.grueso_esperado + ", color_esperado = '" + this.detalle.color_esperado + "', texto_esperado = '" + this.detalle.texto_esperado + "', incluir_ceros = '" + this.detalle.incluir_ceros + "', orden_grafica = '" + this.detalle.orden_grafica + "', color_barra = '" + this.detalle.color_barra + "', color_barra_borde = '" + this.detalle.color_barra_borde + "', ver_leyenda = '" + this.detalle.ver_leyenda + "', overlap = '" + this.detalle.overlap + "', colores_multiples = '" + this.detalle.colores_multiples + "', color_spiline = '" + this.detalle.color_spiline + "', adicionales = '" + this.detalle.adicionales + "', esperado_esquema = '" + this.detalle.esperado_esquema + "', adicionales_colores = '" + this.detalle.adicionales_colores + "', adicionales_titulos = '" + this.detalle.adicionales_titulos + "', grueso_spiline = " + this.detalle.grueso_spiline + ", textos_adicionales = '" + adicional + "', mostrar_argumentos = '" + this.detalle.mostrar_argumentos + "' WHERE grafico = " + (this.grActual * 100 + this.graficaActual) +  " AND usuario = " + this.servicio.rUsuario().id + " AND idioma = " + this.servicio.rIdioma().id; 
      sentencia = sentencia.replace(/null/g, '');
      campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe(resp =>
      {
        this.graficando = true;
        this.formateando = false;
        sentencia = "SELECT id, titulo AS nombre, visualizar FROM " + this.servicio.rBD() + ".pu_graficos WHERE usuario = " + this.servicio.rUsuario().id + " AND grafico = " + (this.grActual * 100 + this.graficaActual) + " AND idioma = " + this.servicio.rIdioma().id;
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          if (resp.length>0)
          {
            resp[0].nro = this.graficaActual
            this.opciones[this.graficaActual - 1] = resp[0];
            this.modelo = 11;
            this.preGraficar(this.graficaActual - 1);
          }
          
        })
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2173]);
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2666]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        
      })
    })
  }

  cambiando(evento: any)
  {
    this.botGuar = true;
    this.botCan = true;
    if (evento.value == 8)
    {
      if (!this.detalle.desde)
      {
        this.detalle.desde = new Date();
      }
      if (!this.detalle.hasta)
      {
        this.detalle.hasta = new Date();
      }
    }
  }

  cambiarDescripcion(evento: any)
  {
      let cadTextoY = "";
      if (this.detalle.texto_y)
      { 
        cadTextoY = this.detalle.texto_y.split(";");
      }
      if (cadTextoY.length == 1)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";;;";
        cadTextoY = this.detalle.texto_y.split(";");
      }
      else if (this.detalle.texto_y.length == 2)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";;";
        cadTextoY = this.detalle.texto_y.split(";");
      }
      else if (this.detalle.texto_y.length == 3)
      {
        this.detalle.texto_y = this.detalle.texto_y + ";";
        cadTextoY = this.detalle.texto_y.split(";");
      } 
      this.detalle.texto_y2 = !this.detalle.texto_y2 ? "" :this.detalle.texto_y2;
      if (this.actualIndice == 0)
      {
        this.detalle.texto_y = this.detalle.texto_y2 + ";" + (cadTextoY[1] ? cadTextoY[1] : "")  + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 1)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + this.detalle.texto_y2 + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 2)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + (cadTextoY[1] ? cadTextoY[1] : "") + ";" + this.detalle.texto_y2 + ";" + (cadTextoY[3] ? cadTextoY[3] : "");
      }
      else if (this.actualIndice == 3)
      {
        this.detalle.texto_y = (cadTextoY[0] ? cadTextoY[0] : "") + ";" + (cadTextoY[1] ? cadTextoY[1] : "") + ";" + (cadTextoY[2] ? cadTextoY[2] : "") + ";" + this.detalle.texto_y2
      }
      this.detalle.texto_y2 = cadTextoY[+evento.value];
      this.actualIndice = +evento.value;
    
  }

  aplicarConsulta(id: number)
  {
    this.filtroReportes = "";
    this.filtroKanban = ""; 
    this.filtroParos = "";
    this.filtroRechazos = "";
    this.filtroMTBF = "";
    this.filtroKRS = "";
    this.filtroK = "";
    this.filtroMTBF_are = "";
    this.filtroMTBF_fal = "";
    this.filtroMTBF_tec = "";
    this.ayuda20 = "";
    this.filtroOEE = "";
    this.filtroCorte = "";
    this.filtroOEEDias = "";
    
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".consultas_cab WHERE id = " + this.servicio.rConsulta() + ";"
    if (this.servicio.rConsulta() == 0)
    {
      sentencia = "SELECT * FROM " + this.servicio.rBD() + ".consultas_cab WHERE usuario = " + this.servicio.rUsuario().id + " AND (defecto = 'S' OR ISNULL(nombre) OR nombre = '') ORDER BY actualizacion DESC LIMIT 1"
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      let desde = new Date();
      let hasta = new Date();
      this.hayFiltro = false;
      if (resp.length > 0)
      { 
        this.ayuda20 = this.servicio.rTraduccion()[2174] + (resp[0].nombre ? resp[0].nombre : this.servicio.rTraduccion()[2175]);
        this.servicio.aConsulta(resp[0].id)
        this.hayFiltro = true;
        resp[0].periodo = resp[0].periodo.trim()
        if (resp[0].periodo == "2")
        {
          if (desde.getDay()==0) 
          {
            //domingo
            desde.setDate(desde.getDate() - 6);
          }
          else 
          {
            desde.setDate(desde.getDate() - (desde.getDay() - 1));
          }
        }
        else if (resp[0].periodo == "3")
        {
          let nuevaFecha = this.servicio.fecha(1, '' , "yyyy/MM") + "/01";         
          desde = new Date(nuevaFecha);
        
        }
        else if (resp[0].periodo == "4")
        {
          let nuevaFecha = this.servicio.fecha(1, '' , "yyyy") + "/01/01";         
          desde = new Date(nuevaFecha);
        }
        else if (resp[0].periodo == "5")
        {
          desde = new Date();
          if (desde.getDay() == 0) 
          {
            desde.setDate(desde.getDate() - 13);
            hasta.setDate(hasta.getDate() - 7);
          }
          else 
          {
            hasta.setDate(hasta.getDate() - (hasta.getDay()));
            desde.setDate(desde.getDate() - (desde.getDay() - 1) - 7);
          }
          
          }
        else if (resp[0].periodo == "6")
        {
          let mesTemp = new Date(this.datepipe.transform(new Date(desde), "yyyy/MM") + "/01");
          mesTemp.setDate(mesTemp.getDate() - 1);
          desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM") + "/01");
          hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM/dd"));
        }
        else if (resp[0].periodo == "7")
        {
          let mesTemp = new Date(this.datepipe.transform(new Date(desde), "yyyy") + "/01/01");
          mesTemp.setDate(mesTemp.getDate() - 1);
          desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/01/01");
          hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/12/31");
          }
        else if (resp[0].periodo == "9")
        {
          desde.setDate(desde.getDate() - 1);
          hasta.setDate(hasta.getDate() - 1);
        }
        if (resp[0].periodo == "8")
        {
          desde = new Date(this.datepipe.transform(new Date(resp[0].desde), "yyyy/MM/dd"));
          hasta = new Date(this.datepipe.transform(new Date(resp[0].hasta), "yyyy/MM/dd"));     
        }
        
        if (resp[0].filtrolin == "N")
        {
          this.filtroReportes = " AND c.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroMTBF = " AND a.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroOEE = this.filtroOEE + " AND a.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroOEEDias = this.filtroOEEDias + " AND j.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroParos = " AND b.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroRechazos = " AND j.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
         
        }
        if (resp[0].filtroori == "0")
        {
          this.filtroReportes = this.filtroReportes + " AND c.origen = 0 ";
        }
        else if (resp[0].filtroori == "1")
        {
          this.filtroReportes = this.filtroReportes + " AND c.origen > 0 ";
        }
        if (resp[0].filtromaq == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.maquina IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroMTBF = this.filtroMTBF + " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          
          this.filtroOEE = this.filtroOEE + " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroOEEDias = this.filtroOEEDias + " AND i.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroParos = this.filtroParos + " AND a.maquina IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroRechazos = this.filtroRechazos + " AND i.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          
        }
        if (resp[0].filtroare == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroMTBF_are = " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroParos = this.filtroParos + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroRechazos = this.filtroRechazos + " AND i.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroKRS = this.filtroKRS + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroKanban = this.filtroKanban + " AND c.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          
        }
        if (resp[0].filtrofal == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.falla_ajustada IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 40) "
          this.filtroMTBF_fal = " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 40) "
        }
        if (resp[0].filtrotec == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.tecnicoatend IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          this.filtroMTBF_tec = " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          this.filtroKRS = this.filtroKRS + " AND a.usuario_asignado IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          if (this.grActual == 7)
          {
            this.filtroKanban = this.filtroKanban + " AND c.usuario_asignado IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          }
          else
          {
            this.filtroKanban = this.filtroKanban + " AND c.surtidor IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          }
        } 
        if (resp[0].filtronpar == "N")
        {
          this.filtroCorte = this.filtroCorte + " AND i.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroParos = this.filtroParos + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroRechazos = this.filtroRechazos + " AND i.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          
          this.filtroOEEDias = this.filtroOEEDias + " AND i.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroKRS = this.filtroKRS + " AND e.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          if (this.grActual == 8)
          {
            this.filtroKanban = this.filtroKanban + " AND c.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          }
          
        } 
        if (resp[0].filtrotur == "N")
        {
          this.filtroCorte = this.filtroCorte + " AND i.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroParos = this.filtroParos + " AND a.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroRechazos = this.filtroRechazos + " AND i.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          
          this.filtroOEEDias = this.filtroOEEDias + " AND i.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroKRS = this.filtroKRS + " AND e.turno_entrega IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          if (this.grActual == 7)
          {
            this.filtroKanban = this.filtroKanban + " AND c.tutno_inicio IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          }
          else
          {
            this.filtroKanban = this.filtroKanban + " AND c.turno_entrega IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          }
        }
        if (resp[0].filtroord == "N")
        {
          this.filtroCorte = this.filtroCorte + " AND i.orden IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroParos = this.filtroParos + " AND a.lote IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroRechazos = this.filtroRechazos + " AND i.orden IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroOEEDias = this.filtroOEEDias + " AND i.orden IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          
        } 
        if (resp[0].filtropar == "N")
        {
          this.filtroParos = this.filtroParos + " AND a.tipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 100) "
          this.filtroRechazos = this.filtroRechazos + " AND i.tipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 120) "
          
        }  
        if (resp[0].filtrooper == "N")
        {
          this.filtroKanban = this.filtroKanban + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
        }
        if (resp[0].filtrocla[0] == "N")
        {
          let filtroClase = " AND (";
          if (resp[0].filtrocla[1] == "S")
          {
            filtroClase = filtroClase + "a.clase = 0"
          }
          if (resp[0].filtrocla[2] == "S")
          {
            filtroClase = filtroClase + (filtroClase == " AND (" ? "a.clase = 1" : " OR a.clase = 1");
          }
          if (resp[0].filtrocla[3] == "S")
          {
            filtroClase = filtroClase + (filtroClase == " AND (" ? "a.clase = 2" : " OR a.clase = 2");
          }
          if (resp[0].filtrocla[4] == "S")
          {
            filtroClase = filtroClase + (filtroClase == " AND (" ? "a.clase = 3" : " OR a.clase = 3");
          }
          if (resp[0].filtrocla[5] == "S")
          {
            filtroClase = filtroClase + (filtroClase == " AND (" ? "a.clase = 4" : " OR a.clase = 4");
          }
          if (filtroClase != " AND (")
          {
            this.filtroParos = this.filtroParos + filtroClase + ") ";
          }
        }        
      } 
      else
      {
        let nuevaFecha = this.servicio.fecha(1, '' , "yyyy/MM") + "/01";         
        desde = new Date(nuevaFecha);
      }
      this.fHasta = this.datepipe.transform(hasta, "yyyy/MM/dd");
      this.fDesde = this.datepipe.transform(desde, "yyyy/MM/dd");  
      this.sub_titulo = this.servicio.rTraduccion()[602] + this.datepipe.transform(desde, "dd-MMM-yyyy") + this.servicio.rTraduccion()[610] + this.datepipe.transform(hasta, "dd-MMM-yyyy");
      this.preGraficar(id == -1 ? (this.graficaActual - 1) : id)
    })
  }
  
  formatear()
  {
    this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2792]);
    this.filtrando = false;
    this.formateando = true;
    this.filtrarC = false;
    this.graficando = false;
    this.bot4Sel = false;
    this.bot7Sel = false;
    this.guardarSel = false;
    this.modelo = 13;
    this.buscarGrafica(1);
  }

  buscarGrafica(accion: number)
  {
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".pu_graficos WHERE id = " + this.idGrafico;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        resp[0].oee_tipoFTQ = resp[0].oee_tipo[0];
        resp[0].oee_tipoEFI = resp[0].oee_tipo[1];
        resp[0].oee_tipoDIS = resp[0].oee_tipo[2];

        resp[0].oee_selFTQ = resp[0].oee[0] == "S";
        resp[0].oee_selEFI = resp[0].oee[1] == "S";
        resp[0].oee_selDIS = resp[0].oee[2] == "S";

        
        resp[0].oee_etiFTQ = resp[0].oee[3];
        resp[0].oee_etiEFI = resp[0].oee[4];
        resp[0].oee_etiDIS = resp[0].oee[5];

        resp[0].oee_etiFTQ = resp[0].oee_etiFTQ != "S" && resp[0].oee_etiFTQ != "N" ? "N" : resp[0].oee_etiFTQ;
        resp[0].oee_etiEFI = resp[0].oee_etiEFI != "S" && resp[0].oee_etiEFI != "N" ? "N" : resp[0].oee_etiEFI;
        resp[0].oee_etiDIS = resp[0].oee_etiDIS != "S" && resp[0].oee_etiDIS != "N" ? "N" : resp[0].oee_etiDIS;

        resp[0].color_letras = resp[0].color_letras ? ("#" + resp[0].color_letras) : "";
        resp[0].etiqueta_color = resp[0].etiqueta_color ? ("#" + resp[0].etiqueta_color) : "";
        resp[0].etiqueta_fondo = resp[0].etiqueta_fondo ? ("#" + resp[0].etiqueta_fondo) : "";
        resp[0].color_leyenda = resp[0].color_leyenda ? ("#" + resp[0].color_leyenda) : "";
        resp[0].color_leyenda_fondo = resp[0].color_leyenda_fondo ? ("#" + resp[0].color_leyenda_fondo) : "";
        resp[0].color_fondo_barras = resp[0].color_fondo_barras ? ("#" + resp[0].color_fondo_barras) : "";
        resp[0].color_fondo = resp[0].color_fondo ? ("#" + resp[0].color_fondo) : "";
        resp[0].color_spiline = resp[0].color_spiline ? ("#" + resp[0].color_spiline) : "";
        resp[0].color_esperado = resp[0].color_esperado ? ("#" + resp[0].color_esperado) : "";
        resp[0].color_barra = resp[0].color_barra ? ("#" + resp[0].color_barra) : "";
        resp[0].color_barra_borde = resp[0].color_barra_borde ? ("#" + resp[0].color_barra_borde) : "";
        resp[0].tipo_valor = resp[0].tipo_principal == "B" ? "bar" : resp[0].tipo_principal == "L" ? "spline" : "area";
        resp[0].tipo_valorFTQ = resp[0].oee_tipo[0] == "B" ? "bar" : resp[0].oee_tipo[0] == "L" ? "spline" : "area";
        resp[0].tipo_valorEFI = resp[0].oee_tipo[1] == "B" ? "bar" : resp[0].oee_tipo[1] == "L" ? "spline" : "area";
        resp[0].tipo_valorDIS = resp[0].oee_tipo[2] == "B" ? "bar" : resp[0].oee_tipo[2] == "L" ? "spline" : "area";
        resp[0].oee_colores = resp[0].oee_colores ? resp[0].oee_colores : ";;";
        let oee_colores = resp[0].oee_colores.split(";");
        resp[0].colorFTQ = oee_colores[0] ? ("#" + oee_colores[0]) : "";
        resp[0].colorEFI = oee_colores[1] ? ("#" + oee_colores[1]) : "";
        resp[0].colorDIS = oee_colores[2] ? ("#" + oee_colores[2]) : "";

        resp[0].oee_nombre = resp[0].oee_nombre ? resp[0].oee_nombre : ";;";
        oee_colores = resp[0].oee_nombre.split(";");
        resp[0].oee_nombreFTQ = oee_colores[0];
        resp[0].oee_nombreEFI = oee_colores[1];
        resp[0].oee_nombreDIS = oee_colores[2];

        oee_colores = resp[0].textos_adicionales.split(";");
        resp[0].adic21 = oee_colores[0];
        resp[0].adic22 = oee_colores[1];
      
        resp[0].esperado_esquema =!resp[0].esperado_esquema ? ";;" : resp[0].esperado_esquema;
        oee_colores = resp[0].esperado_esquema.split(";");
        resp[0].dividir_colores = oee_colores[0] ? oee_colores[0] : "N";
        resp[0].color_bajo = oee_colores[1] ? ("#" + oee_colores[1]) : "";
        resp[0].color_alto = oee_colores[2] ? ("#" + oee_colores[2]) : "";  
      
        resp[0].adicionales_colores = resp[0].adicionales_colores ? resp[0].adicionales_colores : ";;;;;";
        oee_colores = resp[0].adicionales_colores.split(";");
        resp[0].coladic1 = oee_colores[0] ? ("#" + oee_colores[0]) : "";
        resp[0].coladic2 = oee_colores[1] ? ("#" + oee_colores[1]) : "";
        resp[0].coladic3 = oee_colores[2] ? ("#" + oee_colores[2]) : "";    
        resp[0].coladic4 = oee_colores[3] ? ("#" + oee_colores[3]) : "";    
        resp[0].coladic5 = oee_colores[4] ? ("#" + oee_colores[4]) : "";    
        resp[0].coladic6 = oee_colores[5] ? ("#" + oee_colores[5]) : "";    

        resp[0].adicionales = resp[0].adicionales ? resp[0].adicionales : "0;0;0;0;0;0;0";
        resp[0].adicionales = resp[0].adicionales == "NNNNNN" ? "0;0;0;0;0;0;0" : resp[0].adicionales;
        oee_colores = resp[0].adicionales.split(";");
        resp[0].adic1 = oee_colores[0] ? oee_colores[0] : "0";
        resp[0].adic2 = oee_colores[1] ? oee_colores[1] : "0";
        resp[0].adic3 = oee_colores[2] ? oee_colores[2] : "0";
        resp[0].adic4 = oee_colores[3] ? oee_colores[3] : "0";
        resp[0].adic5 = oee_colores[4] ? oee_colores[4] : "0";
        resp[0].adic6 = oee_colores[5] ? oee_colores[5] : "0";
        resp[0].adic7 = oee_colores[6] ? oee_colores[6] : "0";

        
        resp[0].adicionales_titulos = resp[0].adicionales_titulos ? resp[0].adicionales_titulos : ";;;;;";
        oee_colores = resp[0].adicionales_titulos.split(";");
        resp[0].tadic1 = oee_colores[0] ? oee_colores[0] : "";
        resp[0].tadic2 = oee_colores[1] ? oee_colores[1] : "";
        resp[0].tadic3 = oee_colores[2] ? oee_colores[2] : "";
        resp[0].tadic4 = oee_colores[3] ? oee_colores[3] : "";
        resp[0].tadic5 = oee_colores[4] ? oee_colores[4] : "";
        resp[0].tadic6 = oee_colores[5] ? oee_colores[5] : "";
      

        this.detalle = resp[0];
        let cadTextoY = "";
        if (this.detalle.texto_y)
        { 
          cadTextoY = this.detalle.texto_y.split(";");
        }
        this.actualIndice = +this.detalle.orden;
        this.detalle.texto_y2 = cadTextoY[+this.actualIndice];
        
      }
      
    });

    sentencia = "SELECT titulo FROM " + this.servicio.rBD() + ".pu_graficos WHERE grafico = " + (this.grActual * 100 + this.graficaActual) +  " AND usuario = 0 AND idioma = " + this.servicio.rIdioma().id;
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length>0)
      {
        this.nGrafica = resp[0].titulo;
      }
      if (accion==0)
      {
        this.detalle = resp[0];
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2669]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    });
  }

  predeterminados()
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[3406], mensaje: this.servicio.rTraduccion()[3407], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[3408], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_recuperar" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result.accion)
      {
        if (result.accion == 1) 
        {
          let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".pu_graficos WHERE grafico = " + (this.grActual * 100 + this.graficaActual) +  " AND usuario = 0 AND idioma = " + this.servicio.rIdioma().id;
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp.length > 0)
            {
              this.botGuar = true;
              this.botCan = true;
              resp[0].oee_tipoFTQ = resp[0].oee_tipo[0];
              resp[0].oee_tipoEFI = resp[0].oee_tipo[1];
              resp[0].oee_tipoDIS = resp[0].oee_tipo[2];

              resp[0].oee_selFTQ = resp[0].oee[0] == "S";
              resp[0].oee_selEFI = resp[0].oee[1] == "S";
              resp[0].oee_selDIS = resp[0].oee[2] == "S";

              resp[0].oee_etiFTQ = resp[0].oee[3];
              resp[0].oee_etiEFI = resp[0].oee[4];
              resp[0].oee_etiDIS = resp[0].oee[5];
              resp[0].oee_etiFTQ = resp[0].oee_etiFTQ != "S" && resp[0].oee_etiFTQ != "N" ? "N" : resp[0].oee_etiFTQ;
              resp[0].oee_etiEFI = resp[0].oee_etiEFI != "S" && resp[0].oee_etiEFI != "N" ? "N" : resp[0].oee_etiEFI;
              resp[0].oee_etiDIS = resp[0].oee_etiDIS != "S" && resp[0].oee_etiDIS != "N" ? "N" : resp[0].oee_etiDIS;

              resp[0].color_letras = resp[0].color_letras ? ("#" + resp[0].color_letras) : "";
              resp[0].etiqueta_color = resp[0].etiqueta_color ? ("#" + resp[0].etiqueta_color) : "";
              resp[0].etiqueta_fondo = resp[0].etiqueta_fondo ? ("#" + resp[0].etiqueta_fondo) : "";
              resp[0].color_leyenda = resp[0].color_leyenda ? ("#" + resp[0].color_leyenda) : "";
              resp[0].color_leyenda_fondo = resp[0].color_leyenda_fondo ? ("#" + resp[0].color_leyenda_fondo) : "";
              resp[0].color_fondo_barras = resp[0].color_fondo_barras ? ("#" + resp[0].color_fondo_barras) : "";
              resp[0].color_fondo = resp[0].color_fondo ? ("#" + resp[0].etiqueta_fondo) : "";
              resp[0].color_spiline = resp[0].color_spiline ? ("#" + resp[0].color_spiline) : "";
              resp[0].color_esperado = resp[0].color_esperado ? ("#" + resp[0].color_esperado) : "";
              resp[0].color_barra = resp[0].color_barra ? ("#" + resp[0].color_barra) : "";
              resp[0].color_barra_borde = resp[0].color_barra_borde ? ("#" + resp[0].color_barra_borde) : "";

              resp[0].tipo_valor = resp[0].tipo_principal == "B" ? "bar" : resp[0].tipo_principal == "L" ? "spline" : "area";
              resp[0].tipo_valorFTQ = resp[0].oee_tipo[0] == "B" ? "bar" : resp[0].oee_tipo[0] == "L" ? "spline" : "area";
              resp[0].tipo_valorEFI = resp[0].oee_tipo[1] == "B" ? "bar" : resp[0].oee_tipo[1] == "L" ? "spline" : "area";
              resp[0].tipo_valorDIS = resp[0].oee_tipo[2] == "B" ? "bar" : resp[0].oee_tipo[2] == "L" ? "spline" : "area";
              resp[0].oee_colores = resp[0].oee_colores ? resp[0].oee_colores : ";;";
              let oee_colores = resp[0].oee_colores.split(";");
              resp[0].colorFTQ = oee_colores[0] ? ("#" + oee_colores[0]) : "";
              resp[0].colorEFI = oee_colores[1] ? ("#" + oee_colores[1]) : "";
              resp[0].colorDIS = oee_colores[2] ? ("#" + oee_colores[2]) : "";

              resp[0].oee_nombre = resp[0].oee_nombre ? resp[0].oee_nombre : ";;";
              oee_colores = resp[0].oee_nombre.split(";");
              resp[0].oee_nombreFTQ = oee_colores[0];
              resp[0].oee_nombreEFI = oee_colores[1];
              resp[0].oee_nombreDIS = oee_colores[2];

              oee_colores = resp[0].textos_adicionales.split(";");
              resp[0].adic21 = oee_colores[0];
              resp[0].adic22 = oee_colores[1];

              resp[0].esperado_esquema =!resp[0].esperado_esquema ? ";;" : resp[0].esperado_esquema;
              oee_colores = resp[0].esperado_esquema.split(";");
              resp[0].dividir_colores = oee_colores[0] ? oee_colores[0] : "N";
              resp[0].color_bajo = oee_colores[1] ? ("#" + oee_colores[1]) : "";
              resp[0].color_alto = oee_colores[2] ? ("#" + oee_colores[2]) : "";  
      
              resp[0].adicionales_colores = resp[0].adicionales_colores ? resp[0].adicionales_colores : ";;;;;";
              oee_colores = resp[0].adicionales_colores.split(";");
              resp[0].coladic1 = oee_colores[0] ? ("#" + oee_colores[0]) : "";
              resp[0].coladic2 = oee_colores[1] ? ("#" + oee_colores[1]) : "";
              resp[0].coladic3 = oee_colores[2] ? ("#" + oee_colores[2]) : "";    
              resp[0].coladic4 = oee_colores[3] ? ("#" + oee_colores[3]) : "";    
              resp[0].coladic5 = oee_colores[4] ? ("#" + oee_colores[4]) : "";    
              resp[0].coladic6 = oee_colores[5] ? ("#" + oee_colores[5]) : "";    

              resp[0].adicionales = resp[0].adicionales ? resp[0].adicionales : "0;0;0;0;0;0;0";
              resp[0].adicionales = resp[0].adicionales == "NNNNNN" ? "0;0;0;0;0;0;0" : resp[0].adicionales;
              oee_colores = resp[0].adicionales.split(";");
              resp[0].adic1 = oee_colores[0] ? oee_colores[0] : "0";
              resp[0].adic2 = oee_colores[1] ? oee_colores[1] : "0";
              resp[0].adic3 = oee_colores[2] ? oee_colores[2] : "0";
              resp[0].adic4 = oee_colores[3] ? oee_colores[3] : "0";
              resp[0].adic5 = oee_colores[4] ? oee_colores[4] : "0";
              resp[0].adic6 = oee_colores[5] ? oee_colores[5] : "0";
              resp[0].adic7 = oee_colores[6] ? oee_colores[6] : "0";

              
              resp[0].adicionales_titulos = resp[0].adicionales_titulos ? resp[0].adicionales_titulos : ";;;;;";
        
              oee_colores = resp[0].adicionales_titulos.split(";");
              resp[0].tadic1 = oee_colores[0] ? oee_colores[0] : "";
              resp[0].tadic2 = oee_colores[1] ? oee_colores[1] : "";
              resp[0].tadic3 = oee_colores[2] ? oee_colores[2] : "";
              resp[0].tadic4 = oee_colores[3] ? oee_colores[3] : "";
              resp[0].tadic5 = oee_colores[4] ? oee_colores[4] : "";
              resp[0].tadic6 = oee_colores[5] ? oee_colores[5] : "";
      
      
              this.detalle = resp[0];
              let cadTextoY = "";
              if (this.detalle.texto_y)
              { 
                cadTextoY = this.detalle.texto_y.split(";");
              }
              this.actualIndice = +this.detalle.orden;
              this.detalle.texto_y2 = cadTextoY[+this.actualIndice];
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[2670]
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            
          })
        }
      }
    });
    }

  cancelarF()
  {
    this.bot4Sel = false;
    this.botGuar = false;
    this.botCan = false;
    this.buscarGrafica(0);
  }  

  calcularColor(arg: any) {
    let seguir1 = false;
    let seguir2 = false;
    let seguir3 = false;
    
    if ((this.parGrafica.adic1 != 0 && this.parGrafica.coladic1) || (this.parGrafica.adic2 != 0 && this.parGrafica.coladic2) || (this.parGrafica.adic3 != 0 && this.parGrafica.coladic3) || (this.parGrafica.adic4 != 0 && this.parGrafica.coladic4) || (this.parGrafica.adic5 != 0 && this.parGrafica.coladic5) || (this.parGrafica.adic6 != 0 && this.parGrafica.coladic6))
    {
      seguir1 = true
    }
    if (this.parGrafica.valor_esperado && this.parGrafica.dividir_colores == "S" && this.parGrafica.color_alto && this.parGrafica.color_bajo)
    {
      seguir2 = true
    }
    if (!seguir2 && this.parGrafica.colores_multiples=="S")
    {
      seguir3 = true;
    }
    if (!seguir1 && !seguir2 && !seguir3)
    {
      return;
    }
    if (seguir2)
    {
      if(+arg.value > +this.parGrafica.valor_esperado ) {
        return { color: this.parGrafica.color_alto };
      }         
      else { 
        return { color: this.parGrafica.color_bajo };
      }
    }
    else if (seguir1)
    {
      if (arg.index == 0 && this.parGrafica.adic1 != 0 && this.parGrafica.coladic1)
      {
        return { color: this.parGrafica.coladic1};
      }
      else if (arg.index == 1 && this.parGrafica.adic2 != 0 && this.parGrafica.coladic2)
      {
        return { color: this.parGrafica.coladic2};
      }
      else if (arg.index == 2 && this.parGrafica.adic3 != 0 && this.parGrafica.coladic3)
      {
        return { color: this.parGrafica.coladic3};
      }
      else if (arg.index == 3 && this.parGrafica.adic4 != 0 && this.parGrafica.coladic4)
      {
        return { color: this.parGrafica.coladic4};
      }
      else if (arg.index == 4 && this.parGrafica.adic5 != 0 && this.parGrafica.coladic5)
      {
        return { color: this.parGrafica.coladic5};
      }
      else if (arg.index == 5 && this.parGrafica.adic6 != 0 && this.parGrafica.coladic6)
      {
        return { color: this.parGrafica.coladic6};
      }
      else if (seguir3)
      {
        return { color: this.coloresArreglo[arg.index % this.coloresArreglo.length]};
      }
    }
    else if (seguir3)
    {
      return { color: this.coloresArreglo[arg.index % this.coloresArreglo.length]};
      
    }
  }

  terminaGrafico(e: any)
  {
    
    setTimeout(() => {
      
      this.servicio.activarSpinnerSmall.emit(false);
      this.servicio.activarSpinner.emit(false);
    }, 200);
  }

  calcularPCT(arg: any)
  {
    return arg.valueText + "%";
  }

}
