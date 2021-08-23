import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
import { SesionComponent } from '../sesion/sesion.component';
import { DxChartComponent } from "devextreme-angular";
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-exportar',
  templateUrl: './exportar.component.html',
  styleUrls: ['./exportar.component.css'],
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

  
export class ExportarComponent implements OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("txtNombre", { static: false }) txtNombre: ElementRef;
  @ViewChild("txtDesde", { static: false }) txtDesde: ElementRef;
  @ViewChild("txtHasta", { static: false }) txtHasta: ElementRef;
  @ViewChild(DxChartComponent, { static: false }) chart: DxChartComponent;
  @ViewChild("listaLineas", { static: false }) listaLineas: MatSelectionList;
  @ViewChild("listaMaquinas", { static: false }) listaMaquinas: MatSelectionList;
  @ViewChild("listaAreas", { static: false }) listaAreas: MatSelectionList;
  @ViewChild("listaFallas", { static: false }) listaFallas: MatSelectionList;
  @ViewChild("listaTecnicos", { static: false }) listaTecnicos: MatSelectionList;
  @ViewChild("listaTurnos", { static: false }) listaTurnos: MatSelectionList;
  @ViewChild("listaPartes", { static: false }) listaPartes: MatSelectionList;
  @ViewChild("listaLotes", { static: false }) listaLotes: MatSelectionList;
  @ViewChild("listaProcesos", { static: false }) listaProcesos: MatSelectionList;
  
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
    public datepipe: DatePipe,
    private viewportRuler: ViewportRuler
  ) {

    this.servicio.mensajeError.subscribe((mensaje: any)=>
    {
      let mensajes = mensaje.split(";");
      if (mensajes[0] == 1)
      {
        this.pantalla = 1;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2007]);
        this.errorMensaje = mensajes[1];
      }
    });

    this.servicio.vista.subscribe((accion: number)=>
    {
      if (accion == 22)
      {
        this.graficando = true;
        this.filtrando = false;
        this.verTop = true;
        this.modelo = 11;
        this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2015]);   
      }
      else if (accion == 23)
      {
        this.graficando = true;
        this.filtrando = false;
        this.verTop = false;
        this.listarAlarmas()
        this.modelo = 13;
        this.iniLeerBD()
      }
      this.servicio.mostrarBmenu.emit(0);
    });
    this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 9) == "/exportar")
      {
        this.revisarTiempo();
      }
    });
    this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.rConfiguracion();
    this.aplicarConsulta(this.servicio.rConsulta());
    
    if (this.servicio.rVista() == 23)
      {
        this.listarAlarmas()
        this.modelo = 3;
        this.iniLeerBD()
        this.verTop = false;
      }
      else
      {
        this.verTop = true;
      }
  }

  ngOnInit() {
    this.servicio.validarLicencia(1)
    this.servicio.mostrarBmenu.emit(0);
  }

  verTop: boolean = true;
  yaConfirmado: boolean = false;
  modelo: number  = 1;
  offSet: number;
  verIrArriba: boolean = false;
  filtrarC: boolean = false;
  hayFiltro: boolean = false
  eliminar: boolean = false;
  editando: boolean = false;
  graficando: boolean = true;
  verBuscar: boolean = true;
  verTabla: boolean = false;
  cambioVista: boolean = true;
  movil: boolean = false;
  parIndicador: string = this.servicio.rIdioma().decimales
  verGrafico: boolean = false;
  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  error04: boolean = false;
  
  nCatalogo: string = this.servicio.rTraduccion()[1189]
  verBarra: string = "";
  ultimoReporte: string = "";
  procesoReporte: string = "";
  cada5Seg: number = 0;
  nombreFile: string = "";
  ultimoID: number = 0;
  copiandoDesde: number = 0;
  selLineasT: string = "S";
  selMaquinasT: string = "S";
  selAreasT: string = "S";
  selTecnicosT: string = "S";
  selTurnosT: string = "S";
  selPartesT: string = "S";
  selLotesT: string = "S";
  selFallasT: string = "S";
  selProcesosT: string = "S";
  textoBuscar: string = "";
  miGrafica: any = [];
  tecnicos: any = [];
  partes: any = [];
  turnos: any = [];
  lotes: any = [];
  procesos: any = [];
  arreTiempos: any = [];
  consultas: any = [];
  maquinas: any = [];
  parGrafica: any = [];
  sentenciaRtit: string = "";
  sentenciaR: string = "";
  reporteActual: string = "";
  reporteSel: number = 1;
  consultaTemp: string = "0";
  consultaBuscada: boolean = false;
  
  ultimaActualizacion = new Date();
  errorTitulo: string = "[" + this.servicio.rTraduccion()[6] + "]";
  errorMensaje: string = "";
  pantalla: number = 2;  
  miSeleccion: number = 1;
  iconoGeneral: string = "i_alarmas";
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
  nombreReporte: string = "";
  laSeleccion: any = [];
  configuracion: any = [];
  fallas: any = [];
  lineas: any = [];
  areas: any = [];
  areas_k: any = [];
  agrupadores1: any = [];
  agrupadores2: any = [];
  arreImagenes: any = [];
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
  faltaMensaje: string = "";
  responsableSel: boolean = false;
  fallaSel: boolean = false;
  rAlarmado: string = "N";
  horaReporte;
  mensajePadre: string = "";
  filtroParos: string = "";
  filtroAlarmas: string = "";
  filtroFechas: string = "";
  filtroFechasDia: string = "";
  filtroReportes: string = "";
  filtroOEE: string = "";
  filtroHXH: string = "";
  filtroWIP: string = "";
  filtroTrazabilidad: string = "";
  filtroCalidad: string = "";
  filtroKRS: string = "";
  filtroSaldo: string = "";
  filtroMov: string = "";
  filtroK: string = "";
  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";
  mostrarDetalle: boolean = false;
  grActual: number = +this.servicio.rUsuario().preferencias_andon.substr(41, 1);

  ayuda01 = ""

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

  maxmin: {startValue: "0", endValue: 20};

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
      this.modelo = this.modelo - 10;
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
  rConfiguracion()
  {
    this.configuracion = [];
    this.servicio.consultasBD({accion: 100, sentencia: "/configuracion/10"}).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.rListado01();
        this.configuracion = resp[0]; 
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  rListado01()
  {
    let sentencia = "SELECT listado01, listado01_f FROM " + this.servicio.rBD() + ".configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        if (resp[0].listado01 == "S")
        {
          this.procesoReporte = this.servicio.rTraduccion()[3508] + " " + this.servicio.fecha(2, resp[0].listado01_f, this.servicio.rIdioma().fecha_02);  
        }
        else if (resp[0].listado01 == "F")
        {
          this.procesoReporte = this.servicio.rTraduccion()[3509] + " " + this.servicio.fecha(2, resp[0].listado01_f, this.servicio.rIdioma().fecha_02);  
        }
        else
        {
          this.procesoReporte = this.servicio.rTraduccion()[449];
        }
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  descargarInfo()
  {
    this.nombreReporte = this.servicio.rTraduccion()[2020]
    this.reporteActual = this.servicio.rTraduccion()[2028]
    let sentencia = "SELECT COUNT(c.id) AS cuenta FROM " + this.servicio.rBD() + ".reportes c WHERE c.estatus >= 0 " + this.filtroReportes + ";";
    if (this.reporteSel==2)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2018]
      this.reporteActual = this.servicio.rTraduccion()[2026]
      sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".log WHERE id > 0 AND " + this.filtroFechas + ";";
    }
    else if (this.reporteSel==3)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2021]
      this.reporteActual = this.servicio.rTraduccion()[2029]
      sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".alarmas a WHERE a.id > 0 AND " + this.filtroAlarmas + ";";
    }
     if (this.modelo == 3 || this.modelo == 13)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2016]
      this.reporteActual = this.servicio.rTraduccion()[2024]
      sentencia = "SELECT COUNT(id) AS cuenta FROM " + this.servicio.rBD() + ".alarmas WHERE ISNULL(fin);";
    }
    if (this.reporteSel== 4)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2019]
      this.reporteActual = this.servicio.rTraduccion()[2027]
      sentencia = "SELECT COUNT(c.id) AS cuenta FROM " + this.servicio.rBD() + ".lecturas_cortes c LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.equipo = d.id WHERE c.id >= 0 " + this.filtroOEE + ";";
    }
    if (this.reporteSel== 10)
    {
      this.nombreReporte = this.servicio.rTraduccion()[3695]
      this.reporteActual = this.servicio.rTraduccion()[3733]
      sentencia = "SELECT COUNT(a.id) AS cuenta FROM " + this.servicio.rBD() + ".horaxhora a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id WHERE a.id >= 0 " + this.filtroHXH + ";";
    }
    else if (this.reporteSel==5)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2022]
      this.reporteActual = this.servicio.rTraduccion()[2030]
      sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".lotes a WHERE a.id > 0 " + this.filtroWIP + ";";
    }
    else if (this.reporteSel==6)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2023]
      this.reporteActual = this.servicio.rTraduccion()[2031]
      sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".lotes_historia a WHERE a.id > 0 " + this.filtroTrazabilidad + ";";
    }
    else if (this.reporteSel==7)
    {
      this.nombreReporte = this.servicio.rTraduccion()[2017]
      this.reporteActual = this.servicio.rTraduccion()[2025]
      sentencia = "SELECT COUNT(*) AS cuenta FROM " + this.servicio.rBD() + ".calidad_historia a WHERE a.id > 0 " + this.filtroCalidad + ";";
    }
    else if (this.reporteSel==8)
    {
      this.nombreReporte = this.servicio.rTraduccion()[3506]
      this.reporteActual = this.servicio.rTraduccion()[3507]
      sentencia = "SELECT listado01, listado01_f FROM " + this.servicio.rBD() + ".configuracion;";
    }
    else if (this.reporteSel == 20)
    {
      this.nombreReporte = this.servicio.rTraduccion()[4239]
      this.reporteActual = this.servicio.rTraduccion()[4241]
      sentencia = "SELECT COUNT(a.id) AS cuenta FROM " + this.servicio.rBD() + ".rkanban_cab a INNER JOIN " + this.servicio.rBD() + ".rkanban_det e ON a.id = e.kanban WHERE a.id >= 0 " + this.filtroKRS + ";";
    }
    else if (this.reporteSel == 21)
    {
      this.nombreReporte = this.servicio.rTraduccion()[4240]
      this.reporteActual = this.servicio.rTraduccion()[4242]
      sentencia = "SELECT COUNT(a.id) AS cuenta FROM " + this.servicio.rBD() + ".kanban_solicitudes a WHERE a.id >= 0 " + this.filtroK + ";";
    }
    else if (this.reporteSel == 22)
    {
      this.nombreReporte = this.servicio.rTraduccion()[3871]
      this.reporteActual = this.servicio.rTraduccion()[4270]
      sentencia = "SELECT COUNT(a.id) AS cuenta FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a WHERE a.id >= 0 " + this.filtroSaldo + ";";
    }
    else if (this.reporteSel == 23)
    {
      this.nombreReporte = this.servicio.rTraduccion()[4275]
      this.reporteActual = this.servicio.rTraduccion()[4276]
      sentencia = "SELECT COUNT(a.id) AS cuenta FROM " + this.servicio.rBD() + ".kanban_movimientos a WHERE a.id >= 0 " + this.filtroMov + ";";
    }
   

    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length == 0)
      {
        this.miGrafica = [];
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2010]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      else if (resp[0].cuenta == 0)
      {
        this.miGrafica = [];
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2010]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      else if (this.reporteSel==8 && resp[0].listado01 == "T")
      {
        this.miGrafica = [];
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[3510] + " " + this.servicio.fecha(2, resp[0].listado01_f, this.servicio.rIdioma().fecha_02)
        mensajeCompleto.tiempo = 2500;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      else if (this.reporteSel==8 && resp[0].listado01 == "F")
      {

        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "520px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[3512], tiempo: 0, mensaje: this.servicio.rTraduccion()[3511].replace("campo_0", this.servicio.fecha(2, resp[0].listado01_f, this.servicio.rIdioma().fecha_02)), id: 0, accion: 0, botones: 3, boton1STR: this.servicio.rTraduccion()[2260], icono1: "i_descargar", boton2STR: this.servicio.rTraduccion()[3513], icono2: "i_falla", boton3STR: this.servicio.rTraduccion()[77], icono3: "i_cancelar", icono0: "i_reportes" }
        });
        respuesta.afterClosed().subscribe(result => 
        {
          if (result)
          {
            if (result.accion == 1) 
            {
              this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[1349] + "', '" + this.servicio.rTraduccion()[3516] + "', '" + this.servicio.rTraduccion()[3517] + "', '" + this.servicio.rTraduccion()[2162] + "', '" + this.servicio.rTraduccion()[1834] + "', '" + this.servicio.rTraduccion()[1835] + "', '" + this.servicio.rTraduccion()[3519] + "', '" + this.servicio.rTraduccion()[3518] + "', '" + this.servicio.rTraduccion()[1826] + "', '" + this.servicio.rTraduccion()[3520] + "', '" + this.servicio.rTraduccion()[3515] + "', '" + this.servicio.rTraduccion()[748] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2101] + "', '" + this.servicio.rTraduccion()[2322] + "', '" + this.servicio.rTraduccion()[2263] + "', '" + this.servicio.rTraduccion()[3521] + "', '" + this.servicio.rTraduccion()[1884] + "', '" + this.servicio.rTraduccion()[3522] + "', '" + this.servicio.rTraduccion()[1888] + "'";
              this.sentenciaR = "SELECT c.numero, a.lote, a.orden, a.secuencia, a.proceso_desde, a.proceso_hasta, a.tiempo_setup, a.tiempo_espera, a.tiempo_proceso, CASE WHEN a.ultima = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END, a.ciclo, a.creacion, a.prioridad, a.parte, b.referencia, b.nombre, a.proceso, d.nombre, a.equipo, e.nombre FROM " + this.servicio.rBD() + ".listado01_detalle a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id INNER JOIN " + this.servicio.rBD() + ".lotes c ON a.lote = c.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos d ON a.proceso = d.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.equipo = e.id ORDER BY a.lote, a.secuencia ";
              this.exportar();
            }
            if (result.accion == 2) 
            {
              let sentencia = "UPDATE " + this.servicio.rBD() + ".configuracion SET listado01 = 'S', listado01_f = NULL";
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-normal";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3514]
                mensajeCompleto.tiempo = 4500;
                this.servicio.mensajeToast.emit(mensajeCompleto);     
              })
            }
          }
        })
        
      }
      else
        {
          this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[150] + "', '" + this.servicio.rTraduccion()[2036] + "', '" + this.servicio.rTraduccion()[2037] + "', '" + this.servicio.rTraduccion()[2038] + "', '" + this.servicio.rTraduccion()[572] + "', '" + this.servicio.rTraduccion()[3468] + "', '" + this.servicio.rTraduccion()[2039] + "', '" + this.servicio.rTraduccion()[2040] + "', '" + this.servicio.rTraduccion()[2041] + "', '" + this.servicio.rTraduccion()[2042] + "', '" + this.servicio.rTraduccion()[2043] + "', '" + (this.servicio.rVersion().modulos[5] == 1 || this.servicio.rVersion().modulos[10] == 1 ? this.servicio.rTraduccion()[3751] + "', '" : "") + this.servicio.rTraduccion()[2044] + "', '" + this.servicio.rTraduccion()[2045] + "', '" + this.servicio.rTraduccion()[2046] + "', '" + this.servicio.rTraduccion()[2047] + "', '" + this.servicio.rTraduccion()[2048] + "', '" + this.servicio.rTraduccion()[2049] + "', '" + this.servicio.rTraduccion()[2050] + "', '" + this.servicio.rTraduccion()[2051] + "', '" + this.servicio.rTraduccion()[2052] + "', '" + this.servicio.rTraduccion()[2053] + "', '" + this.servicio.rTraduccion()[2054] + "', '" + this.servicio.rTraduccion()[2055] + "', '" + this.servicio.rTraduccion()[2056] + "', '" + this.servicio.rTraduccion()[2057] + "', '" + this.servicio.rTraduccion()[2058] + "', '" + this.servicio.rTraduccion()[4363] + "', '" + this.servicio.rTraduccion()[2059] + "', '" + this.servicio.rTraduccion()[2060] + "', '" + this.servicio.rTraduccion()[2061] + "', '" + this.servicio.rTraduccion()[2062] + "', '" + this.servicio.rTraduccion()[2063] + "', '" + this.servicio.rTraduccion()[2064] + "', '" + this.servicio.rTraduccion()[2065] + "', '" + this.servicio.rTraduccion()[2066] + "', '" + this.servicio.rTraduccion()[2067] + "', '" + this.servicio.rTraduccion()[2096] + "', '" + this.servicio.rTraduccion()[2068] + "', '" + this.servicio.rTraduccion()[2069] + "'" + (this.servicio.rVersion().modulos[2] == 1 ? ", '" + this.servicio.rTraduccion()[1356] + "', '" + this.servicio.rTraduccion()[2070] + "', '" + this.servicio.rTraduccion()[2071] + "', '" + this.servicio.rTraduccion()[2072] + "', '" + this.servicio.rTraduccion()[2073] + "', '" + this.servicio.rTraduccion()[2074] + "', '" + this.servicio.rTraduccion()[2075] + "', '" + this.servicio.rTraduccion()[2076] + "', '" + this.servicio.rTraduccion()[584] + "', '" + this.servicio.rTraduccion()[2077] + "', '" + this.servicio.rTraduccion()[1557] + "', '" + this.servicio.rTraduccion()[2078] + "', '" + this.servicio.rTraduccion()[2079] + "', '" + this.servicio.rTraduccion()[2080] + "', '" + this.servicio.rTraduccion()[2081] + "', '" + this.servicio.rTraduccion()[2082] + "', '" + this.servicio.rTraduccion()[233] + "', '" + this.servicio.rTraduccion()[2083] + "', '" + this.servicio.rTraduccion()[2084] + "', '" + this.servicio.rTraduccion()[748] + "', '" + this.servicio.rTraduccion()[2085] + "' " : "")
           this.sentenciaR = "SELECT c.id, CASE WHEN c.origen = 0 THEN '" + this.servicio.rTraduccion()[2086] + "' ELSE '" + this.servicio.rTraduccion()[1296] + "' END, c.fecha, c.fecha_reporte, IFNULL(l.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.estatus, c.inicio_atencion, c.tiempollegada, c.cierre_atencion, c.tiemporeparacion, c.tiemporeparacion + c.tiempollegada, " + (this.servicio.rVersion().modulos[5] == 1 || this.servicio.rVersion().modulos[10] == 1 ?  "CASE WHEN c.ultimo_rate > 0 THEN (c.tiemporeparacion + c.tiempollegada) / c.ultimo_rate ELSE 0 END, " : "") + "c.inicio_reporte, c.cierre_reporte, c.tiemporeporte, IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.linea, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.maquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.area, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.falla_ajustada, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(j.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(p.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(m.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(k.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.detalle, CASE WHEN c.contabilizar = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END, IFNULL(v.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.contabilizar_fecha, CASE WHEN c.alarmado = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atender = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atendido = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, c.escalado, IFNULL(i.nombre , '" + this.servicio.rTraduccion()[8] + "'), c.falla " + (this.servicio.rVersion().modulos[2] == 1 ? ", w.nombre, w.referencia, z.p1, z.p2, z.p3, z.p4, z.p5, z.plan, z.fecha, z.responsable, z.departamento, z.mano_de_obra, z.material, z.metodo, z.maquina, z.medio_ambiente, z.comentarios, y.nombre, x.nombre, z.creacion, z.modificacion " : "") + " FROM " + this.servicio.rBD() + ".reportes c LEFT JOIN " + this.servicio.rBD() + ".cat_lineas a ON c.linea = a.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON c.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON c.falla_ajustada = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.solicitante = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON c.tecnico = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON c.tecnicoatend = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas i ON c.falla = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales j ON f.departamento = j.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales k ON c.tipo = k.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos l ON c.turno = l.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios m ON c.confirmado = m.id LEFT JOIN " + this.servicio.rBD() + ".causa_raiz z ON c.id = z.reporte LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios y ON z.creado = y.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios x ON z.modificado = x.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes w ON c.herramental = w.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios v ON c.contabilizar_usuario = v.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios p ON c.tecnico_documento = p.id WHERE c.estatus >= 0 " + this.filtroReportes + " ";
          if (this.reporteSel==2)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[584] + "', '" + this.servicio.rTraduccion()[2087] + "', '" + this.servicio.rTraduccion()[579] + "', '" + this.servicio.rTraduccion()[2088] + "', '" + this.servicio.rTraduccion()[2089] + "'";
            this.sentenciaR = "SELECT id, fecha, CASE WHEN aplicacion = 20 THEN '" + this.servicio.rTraduccion()[1296] + "' WHEN aplicacion = 30 THEN '" + this.servicio.rTraduccion()[2478] + "' WHEN aplicacion = 40 THEN '" + this.servicio.rTraduccion()[2479] + "' WHEN aplicacion = 50 THEN '" + this.servicio.rTraduccion()[2480] + "' WHEN aplicacion = 60 THEN '" + this.servicio.rTraduccion()[2481] + "' WHEN aplicacion = 70 THEN '" + this.servicio.rTraduccion()[2482] + "' WHEN aplicacion = 80 THEN '" + this.servicio.rTraduccion()[2483] + "' ELSE '" + this.servicio.rTraduccion()[2484] + "' END, CASE WHEN tipo = 0 THEN '" + this.servicio.rTraduccion()[2485] + "' WHEN tipo = 2 THEN '" + this.servicio.rTraduccion()[2486] + "' WHEN tipo = 9 THEN '" + this.servicio.rTraduccion()[2487] + "' ELSE '" + this.servicio.rTraduccion()[2488] + "' END, proceso, texto FROM " + this.servicio.rBD() + ".log WHERE id >= 0 AND " + this.filtroFechas + " ";
          }
          else if (this.reporteSel==3)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[2489] + "', '" + this.servicio.rTraduccion()[2090] + "', '" + this.servicio.rTraduccion()[837] + "', '" + this.servicio.rTraduccion()[2091] + "', '" + this.servicio.rTraduccion()[2092] + "', '" + this.servicio.rTraduccion()[2093] + "', '" + this.servicio.rTraduccion()[2055] + "', '" + this.servicio.rTraduccion()[1354] + "', '" + this.servicio.rTraduccion()[2094] + "', '" + this.servicio.rTraduccion()[2095] + "', '" + this.servicio.rTraduccion()[2096] + "', '" + this.servicio.rTraduccion()[2097] + "'"; this.sentenciaR = "SELECT a.proceso, CASE WHEN c.estatus = 0 THEN '" + this.servicio.rTraduccion()[160] + "' WHEN c.estatus = 10 THEN '" + this.servicio.rTraduccion()[161] + "' WHEN c.estatus = 100 THEN '" + this.servicio.rTraduccion()[162] + "' ELSE '" + this.servicio.rTraduccion()[163] + "' END, b.nombre, a.inicio, a.fin, CASE WHEN ISNULL(a.fin) THEN TIMEDIFF(NOW() ELSE a.inicio END, SEC_TO_TIME(tiempo)), IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntecnico, CASE WHEN a.fase - 10 < 0 THEN '" + this.servicio.rTraduccion()[8] + "' ELSE a.fase - 10 END, a.repeticiones FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".reportes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.AREA = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas g ON c.maquina = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios e ON c.solicitante = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.tecnico = f.id WHERE a.id >= 0 AND " + this.filtroAlarmas + " ";
            
          }
          else if (this.reporteSel==4)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[2490] + "', '" + this.servicio.rTraduccion()[2098] + "', '" + this.servicio.rTraduccion()[2099] + "', '" + this.servicio.rTraduccion()[572] + "', '" + this.servicio.rTraduccion()[1351] + "', '" + this.servicio.rTraduccion()[2047] + "', '" + this.servicio.rTraduccion()[2048] + "', '" + this.servicio.rTraduccion()[2049] + "', '" + this.servicio.rTraduccion()[2050] + "', '" + this.servicio.rTraduccion()[728] + "', '" + this.servicio.rTraduccion()[2100] + "', '" + this.servicio.rTraduccion()[2101] + "', '" + this.servicio.rTraduccion()[2102] + "', '" + this.servicio.rTraduccion()[2103] + "', '" + this.servicio.rTraduccion()[2104] + "', '" + this.servicio.rTraduccion()[2105] + "', '" + this.servicio.rTraduccion()[2106] + "', '" + this.servicio.rTraduccion()[2107] + "', '" + this.servicio.rTraduccion()[2108] + "', '" + this.servicio.rTraduccion()[4351] + "', '" + this.servicio.rTraduccion()[4352] + "', '" + this.servicio.rTraduccion()[2109] + "', '" + this.servicio.rTraduccion()[2110] + "', '" + this.servicio.rTraduccion()[2111] + "', '" + this.servicio.rTraduccion()[2112] + "', '" + this.servicio.rTraduccion()[2113] + "', '" + this.servicio.rTraduccion()[2114] + "', '" + this.servicio.rTraduccion()[2115] + "', '" + this.servicio.rTraduccion()[2116] + "', '" + this.servicio.rTraduccion()[2117] + "', '" + this.servicio.rTraduccion()[2118] + "', '" + this.servicio.rTraduccion()[2119] + "', '" + this.servicio.rTraduccion()[2120] + "', '" + this.servicio.rTraduccion()[2121] + "'";
            this.sentenciaR = "SELECT c.id, c.dia, b.numero, a.nombre, c.turno, e.nombre, d.linea, d.nombre, c.equipo, f.nombre, f.referencia, c.parte, g.nombre, c.tripulacion, c.tc, CASE WHEN c.tc > 0 THEN 1 / c.tc ELE 0 END, c.produccion, c.produccion_tc, c.calidad, c.retrabajo, c.scrap, c.scrap_tc, c.buffer, c.paro AS tparo, c.tiempo_disponible, CASE WHEN c.tiempo_disponible > 0 THEN c.produccion_tc / (c.tiempo_disponible - (SELECT tparo)) * 100 ELSE 0 END AS i1, CASE WHEN (SELECT i1) > 100 THEN 100 ELSE (SELECT i1) END, CASE WHEN c.tiempo_disponible > 0 THEN (1 - (SELECT tparo) / c.tiempo_disponible) * 100 ELSE 0 END AS i2, CASE WHEN c.produccion_tc > 0 THEN (1 - c.calidad_tc / c.produccion_tc) * 100 ELSE 0 END AS i3, (CASE WHEN (SELECT i1) > 100 THEN 100 ELSE (SELECT i1) END * CASE WHEN (SELECT i2) > 100 THEN 100 ELSE (SELECT i2) END * CASE WHEN (SELECT i3) > 100 THEN 100 ELSE (SELECT i3) END / 10000), CASE WHEN c.tiempo_disponible > 0 THEN c.produccion / c.tiempo_disponible ELSE 0 END, CASE WHEN c.produccion  > 0 THEN c.tiempo_disponible / c.produccion ELSE 0 END, c.bloque_inicia, c.bloque_finaliza FROM " + this.servicio.rBD() + ".lecturas_cortes c LEFT JOIN " + this.servicio.rBD() + ".lotes b ON c.orden = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos a ON c.turno = a.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.equipo = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_lineas e ON d.linea = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes f ON c.parte = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_tripulacion g ON c.tripulacion = g.id WHERE c.id >= 0 " + this.filtroOEE + " ";
            
          }
          else if (this.reporteSel==10)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[3720] + "', '" + this.servicio.rTraduccion()[584] + "', '" + this.servicio.rTraduccion()[1341] + "', '" + this.servicio.rTraduccion()[3721] + "', '" + this.servicio.rTraduccion()[728] + "', '" + this.servicio.rTraduccion()[572] + "', '" + this.servicio.rTraduccion()[3718] + "', '" + this.servicio.rTraduccion()[1299] + "', '" + this.servicio.rTraduccion()[1300] + "', '" + this.servicio.rTraduccion()[3722] + "', '" + this.servicio.rTraduccion()[3723] + "', '" + this.servicio.rTraduccion()[3724] + "', '" + this.servicio.rTraduccion()[2076] + "', '" + this.servicio.rTraduccion()[3644] + "', '" + this.servicio.rTraduccion()[3725] + "', '" + this.servicio.rTraduccion()[3691] + "', '" + this.servicio.rTraduccion()[4351] + "', '" + this.servicio.rTraduccion()[4352] + "', '" + this.servicio.rTraduccion()[3726] + "', '" + this.servicio.rTraduccion()[3727] + "', '" + this.servicio.rTraduccion()[3728] + "', '" + this.servicio.rTraduccion()[3729] + "', '" + this.servicio.rTraduccion()[575] + "', '" + this.servicio.rTraduccion()[576] + "', '" + this.servicio.rTraduccion()[577] + "', '" + this.servicio.rTraduccion()[1323] + "', '" + this.servicio.rTraduccion()[3730] + "', '" + this.servicio.rTraduccion()[3731] + "', '" + this.servicio.rTraduccion()[3732] + "', '" + this.servicio.rTraduccion()[2102] + "', '" + this.servicio.rTraduccion()[233] + "', '" + this.servicio.rTraduccion()[3710]  + "', '" + this.servicio.rTraduccion()[3711] + "', '" + this.servicio.rTraduccion()[3712] + "'";
            this.sentenciaR = "SELECT CASE WHEN a.ruptura = 0 THEN '" + this.servicio.rTraduccion()[3718] + "' WHEN a.ruptura = 1 THEN '" + this.servicio.rTraduccion()[572] + "' WHEN a.ruptura = 2 THEN '" + this.servicio.rTraduccion()[3312] + "' WHEN a.ruptura = 3 THEN '" + this.servicio.rTraduccion()[728] + "' WHEN a.ruptura = 4 THEN '" + this.servicio.rTraduccion()[3721] + "' ELSE '" + this.servicio.rTraduccion()[3718] + "' END, a.dia, b.nombre, c.numero, i.nombre, d.nombre, a.hora, a.desde, a.hasta, CASE WHEN a.disponible = 3599 THEN 3600 ELSE a.disponible END, a.paro, a.tc, a.plan, a.plan_van, a.buenas - a.malas, a.malas, a.retrabajo, a.rechazo, a.buenas, (a.plan - a.buenas) * -1, CASE WHEN CASE WHEN a.plan > 0 THEN (a.buenas / a.plan ) * 100 ELSE 0 END > 100 THEN 100 ELSE CASE WHEN a.plan > 0 THEN (a.buenas / a.plan ) * 100 ELSE 0 END END, a.buenas_vienen + a.malas_vienen, CASE WHEN (a.tiempo - a.paro) > 0 THEN (a.buenas_tc) / (a.tiempo - a.paro) * 100 ELSE 0 END AS rendimiento, CASE WHEN a.malas > 0 THEN (1 - a.malas_tc / a.buenas_tc) * 100 ELSE 100 END AS calidad, CASE WHEN a.paro > 0 AND a.tiempo > 0 THEN (1 - a.paro / a.tiempo) * 100 ELSE 100 END AS disponibilidades, (SELECT CASE WHEN rendimiento > 100 THEN 100 ELSE rendimiento END) * (SELECT calidad) * (SELECT disponibilidades) / 10000, CASE WHEN a.buenas > 0 THEN a.tiempo / a.buenas ELSE 0 END AS tcreal, a.diferencia_vienen, CASE WHEN A.tipo = 0 THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, e.nombre, a.comentarios, f.nombre, g.nombre, h.nombre FROM " + this.servicio.rBD() + ".horaxhora a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id LEFT JOIN " + this.servicio.rBD() + ".lotes c ON a.lote = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos d ON a.turno = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_tripulacion e ON a.tripulacion_inicial = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales f ON a.causa = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales g ON a.responsable = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales h ON a.responsable2 = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes i ON a.parte = i.id WHERE a.estatus IN ('A', 'Z') " + this.filtroHXH + " ";
            
          }
          else if (this.reporteSel==5)
          {
          this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[558] + "', '" + this.servicio.rTraduccion()[2122] + "', '" + this.servicio.rTraduccion()[2123] + "', '" + this.servicio.rTraduccion()[2124] + "', '" + this.servicio.rTraduccion()[2125] + "', '" + this.servicio.rTraduccion()[2126] + "', '" + this.servicio.rTraduccion()[2127] + "', '" + this.servicio.rTraduccion()[2128] + "', '" + this.servicio.rTraduccion()[707] + "', '" + this.servicio.rTraduccion()[2129] + "', '" + this.servicio.rTraduccion()[2130] + "', '" + this.servicio.rTraduccion()[2131] + "', '" + this.servicio.rTraduccion()[2132] + "', '" + this.servicio.rTraduccion()[754] + "', '" + this.servicio.rTraduccion()[2133] + "', '" + this.servicio.rTraduccion()[2134] + "', '" + this.servicio.rTraduccion()[1896] + "', '" + this.servicio.rTraduccion()[1897] + "', '" + this.servicio.rTraduccion()[2135] + "', '" + this.servicio.rTraduccion()[2136] + "', '" + this.servicio.rTraduccion()[2137] + "', '" + this.servicio.rTraduccion()[2138] + "', '" + this.servicio.rTraduccion()[2139] + "', '" + this.servicio.rTraduccion()[2140] + "', '" + this.servicio.rTraduccion()[2141] + "', '" + this.servicio.rTraduccion()[2142] + "', '" + this.servicio.rTraduccion()[2143] + "', '" + this.servicio.rTraduccion()[2144] + "', '" + this.servicio.rTraduccion()[2145] + "'";
          this.sentenciaR = "SELECT a.id, a.numero, a.inicia, a.estimada, a.finaliza, a.tiempo, a.tiempo_estimado, (a.tiempo_estimado - a.tiempo), CASE WHEN a.estatus = 'A' THEN '" + this.servicio.rTraduccion()[1154] + "' ELSE '" + this.servicio.rTraduccion()[1155] + "' END AS estatus, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL((SELECT MIN(orden) FROM " + this.servicio.rBD() + ".prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 10000) AS prioridad, j.carga  , CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[2274] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2276] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 80 THEN 'En Inspeccion' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[2617] + "' WHEN a.estado = 99 THEN '" + this.servicio.rTraduccion()[1208] + "' END as estado, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nruta_detalle, ruta_secuencia, a.inspecciones, a.inspeccion, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_causa, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_por, a.rechazos, a.rechazo, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS recha_causa, IFNULL(i.nombre, '" + this.servicio.rTraduccion()[8] + "') AS recha_por, a.alarmas, CASE WHEN a.alarma_tse = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END, CASE WHEN a.alarma_tpe = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END FROM " + this.servicio.rBD() + ".lotes a LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON a.equipo = b.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas c ON a.ruta_detalle = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios i ON a.rechazado_por = i.id LEFT JOIN " + this.servicio.rBD() + ".cargas j ON a.carga = j.id WHERE a.id > 0 " + this.filtroWIP + " "; 
          }
          else if (this.reporteSel==6)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[1349] + "', '" + this.servicio.rTraduccion()[2146] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[1897] + "', '" + this.servicio.rTraduccion()[2147] + "', '" + this.servicio.rTraduccion()[568] + "', '" + this.servicio.rTraduccion()[2123] + "', '" + this.servicio.rTraduccion()[2148] + "', '" + this.servicio.rTraduccion()[2149] + "', '" + this.servicio.rTraduccion()[2150] + "', '" + this.servicio.rTraduccion()[2151] + "', '" + this.servicio.rTraduccion()[700] + "', '" + this.servicio.rTraduccion()[1823] + "', '" + this.servicio.rTraduccion()[1826] + "', '" + this.servicio.rTraduccion()[2152] + "', '" + this.servicio.rTraduccion()[2153] + "', '" + this.servicio.rTraduccion()[2128] + "', '" + this.servicio.rTraduccion()[2154] + "', '" + this.servicio.rTraduccion()[2155] + "', '" + this.servicio.rTraduccion()[2156] + "', '" + this.servicio.rTraduccion()[2157] + "'";
            this.sentenciaR = "SELECT b.numero, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(c.referencia, '" + this.servicio.rTraduccion()[8] + "'), a.ruta_secuencia, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_estimada, a.fecha_salida, a.tiempo_espera, a.tiempo_stock, a.tiempo_proceso, a.tiempo_total, a.tiempo_estimado, (a.tiempo_estimado - a.tiempo_total), a.ruta_secuencia_antes, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "'), CASE WHEN a.alarma_so = 'N' THEN '" + this.servicio.rTraduccion()[1892] + "' ELSE '" + this.servicio.rTraduccion()[1891] + "' END, a.reversos FROM " + this.servicio.rBD() + ".lotes_historia a LEFT JOIN " + this.servicio.rBD() + ".lotes b ON a.lote = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON b.parte = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON a.proceso = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas e ON a.equipo = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos f ON a.proceso_anterior = f.id  WHERE a.id > 0 " + this.filtroTrazabilidad + " "; 
          }
          else if (this.reporteSel==7)
          {
          this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[763] + "', '" + this.servicio.rTraduccion()[2158] + "', '" + this.servicio.rTraduccion()[2159] + "', '" + this.servicio.rTraduccion()[2160] + "', '" + this.servicio.rTraduccion()[579] + "', '" + this.servicio.rTraduccion()[2161] + "', '" + this.servicio.rTraduccion()[2147] + "', '" + this.servicio.rTraduccion()[568] + "', '" + this.servicio.rTraduccion()[2162] + "', '" + this.servicio.rTraduccion()[2163] + "', '" + this.servicio.rTraduccion()[2164] + "', '" + this.servicio.rTraduccion()[2165] + "', '" + this.servicio.rTraduccion()[2166] + "'";
          this.sentenciaR = "SELECT b.numero, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(d.referencia, '" + this.servicio.rTraduccion()[8] + "') AS referencia, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_causa, CASE WHEN a.tipo = 0 THEN '" + this.servicio.rTraduccion()[1751] + "' ELSE '" + this.servicio.rTraduccion()[2167] + "' END, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "') AS insp_por, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(i.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.secuencia, IFNULL(j.nombre, '" + this.servicio.rTraduccion()[8] + "'), a.inicia, a.finaliza, a.tiempo FROM " + this.servicio.rBD() + ".calidad_historia a LEFT JOIN " + this.servicio.rBD() + ".lotes b ON a.lote = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas i ON a.equipo = i.id LEFT JOIN " + this.servicio.rBD() + ".det_rutas j ON a.secuencia = j.id WHERE a.id > 0 " + this.filtroCalidad + " "; 
          }
          else if (this.reporteSel==20)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[150] + "', '" + this.servicio.rTraduccion()[1766] + "', '" + this.servicio.rTraduccion()[3818] + "', '" + this.servicio.rTraduccion()[3819] + "', '" + this.servicio.rTraduccion()[3986] + "', '" + this.servicio.rTraduccion()[3418] + "', '" + this.servicio.rTraduccion()[4175] + "', '" + this.servicio.rTraduccion()[4244] + "', '" + this.servicio.rTraduccion()[4245] + "', '" + this.servicio.rTraduccion()[2604] + "', '" + this.servicio.rTraduccion()[4247] + "', '" + this.servicio.rTraduccion()[4248] + "', '" + this.servicio.rTraduccion()[4207] + "', '" + this.servicio.rTraduccion()[4249] + "', '" + this.servicio.rTraduccion()[4250] + "', '" + this.servicio.rTraduccion()[4251] + "', '" + this.servicio.rTraduccion()[1897] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[728] + "', '" + this.servicio.rTraduccion()[3905] + "', '" + this.servicio.rTraduccion()[3978] + "', '" + this.servicio.rTraduccion()[3979] + "', '" + this.servicio.rTraduccion()[644] + "', '" + this.servicio.rTraduccion()[4182] + "', '" + this.servicio.rTraduccion()[4252] + "', '" + this.servicio.rTraduccion()[4265] + "', '" + this.servicio.rTraduccion()[4253] + "', '" + this.servicio.rTraduccion()[4254] + "', '" + this.servicio.rTraduccion()[4255] + "', '" + this.servicio.rTraduccion()[4256] + "', '" + this.servicio.rTraduccion()[4257] + "', '" + this.servicio.rTraduccion()[4246] + "'";
            this.sentenciaR = "SELECT a.id, a.nombre, a.inicio, a.fin, b.nombre, c.nombre, a.notas, CASE WHEN a.tipo = 0 THEN '" + this.servicio.rTraduccion()[4204] + "' ELSE '" + this.servicio.rTraduccion()[612] + "' END, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[4181] + "' WHEN a.estado = 5 THEN '" + this.servicio.rTraduccion()[4182] + "' WHEN a.estado = 10 THEN '" + this.servicio.rTraduccion()[3535] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[1018] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[4183] + "' END, a.alarmas, a.total_lineas, a.lineas_completadas, a.linea_siguiente, d.nombre, a.cancelado_fecha, CASE WHEN a.respetar_secuencia = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END, e.secuencia, f.referencia, f.nombre, i.nombre, e.cantidad_solicitada, e.cantidad_confirmada, k.nombre, e.planeado, e.ejecutado, j.nombre, g.nombre, e.cancelado_fecha, h.nombre, CASE WHEN e.alarmado = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END, e.alarmado_fecha, CASE WHEN e.estado = 0 THEN '" + this.servicio.rTraduccion()[4182] + "' WHEN e.estado = 5 THEN '" + this.servicio.rTraduccion()[4211] + "' WHEN e.estado = 10 THEN '" + this.servicio.rTraduccion()[3536] + "' WHEN e.estado = 90 THEN '" + this.servicio.rTraduccion()[4183] + "' WHEN e.estado = 99 THEN '" + this.servicio.rTraduccion()[4243] + "' END FROM " + this.servicio.rBD() + ".rkanban_cab a LEFT JOIN " + this.servicio.rBD() + ".cat_areas b ON a.area = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios c ON a.usuario_asignado = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios d ON a.cancelado_por = d.id INNER JOIN " + this.servicio.rBD() + ".rkanban_det e ON a.id = e.kanban LEFT JOIN " + this.servicio.rBD() + ".cat_partes f ON e.parte = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON e.ejecutado_por = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON e.cancelado_por = h.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos i ON e.proceso = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos j ON e.turno_entrega = j.id LEFT JOIN sigma.cat_generales k ON f.kanban_unidad = k.id WHERE a.id > 0 " + this.filtroKRS + " ORDER BY a.id, e.secuencia "; 
          }
          else if (this.reporteSel==21)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[150] + "', '" + this.servicio.rTraduccion()[4262] + "', '" + this.servicio.rTraduccion()[4263] + "', '" + this.servicio.rTraduccion()[2098] + "', '" + this.servicio.rTraduccion()[4264] + "', '" + this.servicio.rTraduccion()[4265] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[3906] + "', '" + this.servicio.rTraduccion()[4044] + "', '" + this.servicio.rTraduccion()[754] + "', '" + this.servicio.rTraduccion()[3986] + "', '" + this.servicio.rTraduccion()[3978] + "', '" + this.servicio.rTraduccion()[3979] + "', '" + this.servicio.rTraduccion()[644] + "', '" + this.servicio.rTraduccion()[3878] + "', '" + this.servicio.rTraduccion()[4267] + "', '" + this.servicio.rTraduccion()[3861] + "', '" + this.servicio.rTraduccion()[4302] + "', '" + this.servicio.rTraduccion()[154] + "', '" + this.servicio.rTraduccion()[4268] + "', '" + this.servicio.rTraduccion()[4303] + "', '" + this.servicio.rTraduccion()[4269] + "'";
            this.sentenciaR = "SELECT a.id, a.fecha_sugerida, CASE WHEN a.clase = 1 THEN '" + this.servicio.rTraduccion()[4204] + "' ELSE '" + this.servicio.rTraduccion()[612] + "' END, a.fecha_reporte, b.nombre, c.nombre, d.referencia, d.nombre, e.nombre, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[4181] + "' WHEN a.estado = 10 THEN '" + this.servicio.rTraduccion()[4261] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[3872] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[4260] + "' END, f.nombre, a.cantidad_solicitada, a.cantidad_confirmada, i.nombre, a.fecha_entrega, a.tiempo, a.lead_time, CASE WHEN a.evaluacion = 'P' THEN '" + this.servicio.rTraduccion()[4300] + "' ELSE '" + this.servicio.rTraduccion()[4301] + "' END, g.nombre, h.nombre, j.nombre, CASE WHEN a.alarmado = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END FROM " + this.servicio.rBD() + ".kanban_solicitudes a LEFT JOIN " + this.servicio.rBD() + ".cat_turnos b ON a.turno = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos c ON a.turno_entrega = c.id INNER JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas f ON a.area = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON a.solicitante = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON a.surtidor = h.id LEFT JOIN sigma.cat_generales i ON d.kanban_unidad = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios j ON a.confirmador = j.id WHERE a.id > 0 " + this.filtroK; 
          }
          else if (this.reporteSel==22)
          {
          this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[728] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[705] + "', '" + this.servicio.rTraduccion()[3986] + "', '" + this.servicio.rTraduccion()[4094] + "', '" + this.servicio.rTraduccion()[4006] + "', '" + this.servicio.rTraduccion()[644] + "'";
          this.sentenciaR = "SELECT d.nombre, d.referencia, e.nombre, f.nombre, saldo, por_surtir, i.nombre FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas f ON a.area = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales i ON d.kanban_unidad = i.id WHERE a.proceso > 0 " + this.filtroSaldo + " ORDER BY 1, 3 "
          }
          else if (this.reporteSel==23)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[150] + "', '" + this.servicio.rTraduccion()[584] + "', '" + this.servicio.rTraduccion()[4271] + "', '" + this.servicio.rTraduccion()[4272] + "', '" + this.servicio.rTraduccion()[572] + "', '" + this.servicio.rTraduccion()[728] + "', '" + this.servicio.rTraduccion()[698] + "', '" + this.servicio.rTraduccion()[705] + "', '" + this.servicio.rTraduccion()[3986] + "', '" + this.servicio.rTraduccion()[4273] + "', '" + this.servicio.rTraduccion()[586] + "', '" + this.servicio.rTraduccion()[4274] + "', '" + this.servicio.rTraduccion()[644] + "', '" + this.servicio.rTraduccion()[2161] + "', '" + this.servicio.rTraduccion()[4067] + "', '" + this.servicio.rTraduccion()[4088] + "'";
            this.sentenciaR = "SELECT a.id, a.fecha, CASE WHEN a.clase = 0 THEN '" + this.servicio.rTraduccion()[4204] + "' ELSE '" + this.servicio.rTraduccion()[612] + "' END, CASE WHEN a.tipo = 'R' THEN '" + this.servicio.rTraduccion()[4089] + "' WHEN a.tipo = 'C' THEN '" + this.servicio.rTraduccion()[4047] + "' WHEN a.tipo = 'A' THEN '" + this.servicio.rTraduccion()[4046] + "' END, b.nombre, d.nombre, d.referencia, e.nombre, f.nombre, a.saldo_ubicacion_antes, a.cantidad, a.saldo_ubicacion_antes + a.cantidad, i.nombre, g.nombre, a.notas, j.nombre FROM " + this.servicio.rBD() + ".kanban_movimientos a LEFT JOIN " + this.servicio.rBD() + ".cat_turnos b ON a.turno = b.id INNER JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas f ON a.area = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON a.usuario = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales i ON d.kanban_unidad = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales j ON a.causa = j.id WHERE a.id > 0 " + this.filtroMov + " ORDER BY a.fecha DESC "; 
          }
          if (this.modelo == 3 || this.modelo == 13)
          {
            this.sentenciaRtit = "SELECT '" + this.servicio.rTraduccion()[2489] + "', '" + this.servicio.rTraduccion()[2090] + "', '" + this.servicio.rTraduccion()[837] + "', '" + this.servicio.rTraduccion()[2091] + "', '" + this.servicio.rTraduccion()[2093] + "', '" + this.servicio.rTraduccion()[2055] + "', '" + this.servicio.rTraduccion()[1354] + "', '" + this.servicio.rTraduccion()[2094] + "', '" + this.servicio.rTraduccion()[2095] + "', '" + this.servicio.rTraduccion()[2096] + "', '" + this.servicio.rTraduccion()[2097] + "'";
            this.sentenciaR = "SELECT a.proceso, CASE WHEN c.estatus = 0 THEN '" + this.servicio.rTraduccion()[160] + "' WHEN c.estatus = 10 THEN '" + this.servicio.rTraduccion()[161] + "' WHEN c.estatus = 100 THEN '" + this.servicio.rTraduccion()[162] + "' ELSE '" + this.servicio.rTraduccion()[163] + "' END, b.nombre, a.inicio, TIMEDIFF(NOW(), a.inicio), IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nmaquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntecnico, CASE WHEN a.fase - 10 < 0 THEN '" + this.servicio.rTraduccion()[8] + "' ELSE a.fase - 10 END, a.repeticiones FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".reportes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.AREA = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas g ON c.maquina = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios e ON c.solicitante = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.tecnico = f.id WHERE ISNULL(a.fin) ORDER BY 3;";
          }
          
          this.exportar()
        }
    })
  }

  
  selectionChange(event){
    console.log('selection changed using keyboard arrow');
  }

  
  exportar()
  {
    
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
            this.servicio.generarReporte(resp, this.nombreReporte, this.reporteActual + ".csv", respTit)
          }
        })
      }
    });
  }

  siguienteInactivar(id: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "500px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[2168], tiempo: 0, mensaje: this.servicio.rTraduccion()[2169].replace("campo_0", this.registros[id].proceso), id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[2170], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alarmas" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        if (result.accion == 1) 
        {
          let sentencia = "SELECT a.*, c.informar_resolucion, c.evento FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".cat_alertas c ON a.alerta = c.id WHERE a.id = " + this.registros[id].id;
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (+resp[0].evento == 101) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET alarmado_atender = 'Y' WHERE id = " + resp[0].proceso;
            }
            else if (+resp[0].evento == 102) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET alarmado_atendido = 'Y' WHERE id = " + resp[0].proceso;
            }
            else if (+resp[0].evento == 103) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".reportes SET alarmado = 'Y' WHERE id = " + resp[0].proceso;
            } 
            else if (+resp[0].evento == 201) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_bajo = 'N' WHERE equipo = " + resp[0].proceso;
            }
            else if (+resp[0].evento == 202) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_alto = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 204) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_ftq = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 205) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_dis = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 206) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_efi = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 207) 
            {
              sentencia = "UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_oee = 'N' WHERE equipo = " + resp[0].proceso;
            }   
            sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".alarmas SET estatus = 9, fin = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicio))" + (resp[0].informar_resolucion == "S" ? ", informado = 'S'" : "") + ", termino = " + this.servicio.rUsuario().id + " WHERE id = " + this.registros[id].id + ";UPDATE " + this.servicio.rBD() + ".mensajes SET estatus = 'Z' where alarma = " + this.registros[id].id;
            if (resp[0].informar_resolucion == "S")
            {
              sentencia = sentencia + ";INSERT INTO " + this.servicio.rBD() + ".mensajes (alerta, canal, tipo, proceso, alarma, lista) SELECT a.alerta, b.canal, 7, a.proceso, a.id, b.lista FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".mensajes b ON a.id = b.alarma WHERE a.id = " + this.registros[id].id + " AND a.estatus = 9  GROUP BY a.alerta, b.canal, a.proceso, a.id, b.lista";
            }
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[3396].replace("campo_0", this.registros[id].proceso)
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.registros.splice(id, 1);
              this.contarRegs(); 
              this.noLeer = false;   
            })
          });
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2013]
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2013]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  inactivar(id: number)
  {

  let rolBuscar = "A";
  if (this.servicio.rUsuario().rol == rolBuscar)
  {
    this.siguienteInactivar(id);
  }
  else
  {
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".relacion_usuarios_opciones WHERE usuario = " + this.servicio.rUsuario().id + " AND opcion = 30";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0) 
      {
        this.siguienteInactivar(id);
      }
      else
      {
        const respuesta = this.dialogo.open(SesionComponent, 
        {
          width: "400px", panelClass: 'dialogo', data: { tiempo: 10, sesion: 1, rolBuscar: rolBuscar, opcionSel: 30, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[2171], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
        });
        respuesta.afterClosed().subscribe(result => 
        {

          if (result)
          {
            if (result.accion == 1) 
            {
              this.siguienteInactivar(id);
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

          })
        }
      })
    }
  }

  cancelarTodas()
  {
  
  this.yaConfirmado = false;
  let rolBuscar = "A";
  if (this.servicio.rUsuario().rol == rolBuscar)
  {
    this.siguienteCancelar();
  }
  else
  {
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".relacion_usuarios_opciones WHERE usuario = " + this.servicio.rUsuario().id + " AND opcion = 30";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0) 
      {
        this.siguienteCancelar();
      }
      else
      {
        const respuesta = this.dialogo.open(SesionComponent, 
        {
          width: "400px", panelClass: 'dialogo', data: { tiempo: 10, sesion: 1, rolBuscar: rolBuscar, opcionSel: 30, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[2171], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
        });
        respuesta.afterClosed().subscribe(result => 
        {

          if (result)
          {
            if (result.accion == 1) 
            {
              this.yaConfirmado = true;
              this.siguienteCancelar();
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

          })
        }
      })
    }
  }


  //Desde aqui
  

filtrar()
{
  this.listarConsultas()
  this.filtrando = true;
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
  this.listarFallas();
  this.listarTecnicos();
  this.listarPartes();
  this.listarTurnos();
  this.listarLotes();
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
      this.detalle = resp[0]; 
      this.detalle.periodo = +this.detalle.periodo;
      if (this.detalle.periodo==8)
      {
        this.detalle.desde = new Date(this.detalle.desde);
        this.detalle.hasta = new Date(this.detalle.hasta);
      }
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
      this.detalle.filtrotur = "S";
      this.detalle.filtronpar = "S";
      this.detalle.filtroord = "S";
      this.detalle.filtrooper = "S";
      
    }
    this.consultaBuscada = false;
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
  this.modelo = 11;
  this.graficando = true;
  this.filtrando = false;
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


  listarAlarmas()
  {
    let sentencia = "SELECT * FROM (SELECT a.*, b.evento, 0 AS indicador, c.estatus AS restatus, NOW() AS hasta, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, '' AS n1, '' AS n2 FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".reportes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.AREA = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios e ON c.solicitante = e.id WHERE ISNULL(fin) AND b.evento < 200 UNION ALL SELECT a.*, b.evento, CASE WHEN b.evento < 203 THEN c.rate ELSE c.oee END AS indicador, c.estatus AS restatus, NOW() AS hasta, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, '' AS n1, '' AS n2 FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".relacion_maquinas_lecturas c ON a.proceso = c.equipo LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.equipo = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_lineas e ON d.linea = e.id WHERE ISNULL(fin) AND b.evento > 200 AND b.evento < 300 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.hasta, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, c.numero, e.referencia FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".lotes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.equipo = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes e ON c.parte = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas f ON c.equipo = f.id WHERE ISNULL(fin) AND b.evento > 301 AND b.evento < 304 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.fecha, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, c.carga, '' FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".cargas c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.equipo = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas f ON c.equipo = f.id WHERE ISNULL(fin) AND b.evento = 304 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.fecha_sugerida, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, c.id, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".kanban_solicitudes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.proceso = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes f ON c.parte = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas g ON c.area = g.id WHERE ISNULL(fin) AND b.evento = 501 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.planeado, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, c.kanban, IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".rkanban_det c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.proceso = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes f ON c.parte = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas g ON c.area = g.id WHERE ISNULL(fin) AND b.evento = 502) AS qry01 ORDER BY inicio;"
    this.registros = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.registros = resp;
      this.arreTiempos.length = resp.length;
      this.revisarTiempo();
      this.contarRegs();
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
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[2032], mensaje: this.servicio.rTraduccion()[2034], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[1981], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_eliminar" }
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
            this.detalle.filtrotur = "S";
            this.detalle.filtronpar = "S";
            this.detalle.filtroord = "S";
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

  listarProcesos()
  {
    let cadAdicional = "";
    if (this.reporteSel==20 || this.reporteSel==21)
    {
      cadAdicional = " WHERE  a.kanban = 'S' "
    }
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_procesos a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 90 AND b.consulta = " + this.consultaTemp + cadAdicional + " ORDER BY seleccionado DESC, a.nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.procesos = resp;
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

  listarAreas()
  {
    let sentencia = "SELECT a.id, a.nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_areas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 30 AND b.consulta = " + this.consultaTemp + " WHERE a.andon = 'S' ORDER BY seleccionado DESC, a.nombre;"
    this.areas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.areas = resp;
      }, 300);
    });
    sentencia = "SELECT a.id, a.nombre, a.kanban, a.andon, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_areas a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 30 AND b.consulta = " + this.consultaTemp + " WHERE a.kanban = 'S' ORDER BY seleccionado DESC, a.nombre;"
    this.areas_k = [];
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.areas_k = resp;
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
    if (this.reporteSel==20)
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

  listarPartes()
  {
    let cadAdicional = "";
    if (this.reporteSel==20 || this.reporteSel==21)
    {
      cadAdicional = " WHERE  a.kanban = 'S' "
    }
    else if (this.reporteSel == 4 || this.reporteSel == 10)
    {
      cadAdicional = " WHERE  a.oee = 'S' "
    }
    else if (this.reporteSel >= 5 && this.reporteSel <= 8)
    {
      cadAdicional = " WHERE  a.wip = 'S' "
    }

    let sentencia = "SELECT a.id, CASE WHEN ISNULL(a.referencia) THEN a.nombre ELSE CONCAT(a.nombre, '" + this.servicio.rTraduccion()[2637] + "', a.referencia, ')') END AS nombre, CASE WHEN ISNULL(b.valor) THEN 0 ELSE 1 END AS seleccionado FROM " + this.servicio.rBD() + ".cat_partes a LEFT JOIN " + this.servicio.rBD() + ".consultas_det b ON b.valor = a.id AND b.tabla = 60 AND b.consulta = " + this.consultaTemp + cadAdicional + " ORDER BY seleccionado DESC, nombre;"
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
          this.areas[i].seleccionado = event.value;
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
        for (var i = 0; i < this.procesos.length; i++) 
        {
          this.procesos[i].seleccionado = event.value;
        }
        setTimeout(() => {
          this.detalle.filtrooper = "N";   
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
        this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[2172]
    }
    else if ((!this.detalle.nombre || this.detalle.nombre=="") && id == 1)
    {
        errores = errores + 1;
        this.error01 = true;
        this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[2172]
    }
    if (this.detalle.periodo == "8")
    {
      if (!this.detalle.desde) 
      {
        errores = errores + 1;
          this.error02 = true;
          this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[1480]
      }

      if (!this.detalle.hasta) 
      {
        errores = errores + 1;
          this.error03 = true;
          this.faltaMensaje = this.faltaMensaje + "<br>" + errores + this.servicio.rTraduccion()[1479]
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
        else if (this.error04)
        {
          this.txtHasta.nativeElement.focus();
        }
      }, 300);
      return;
    }
    if (id== 1 && !this.consultaBuscada)
      {
        this.consultaBuscada = true;
        this.buscarConsultaID();
        return;
      }
      this.consultaBuscada = false;
    this.editando = false;
    this.faltaMensaje = "";
    if (id == 0 && !this.detalle.nombre)
    {
      this.detalle.publico = "N";
    }
    this.botGuar = false;
    this.botCan = false;
    
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
    this.detalle.filtropar = this.detalle.filtropar ? this.detalle.filtropar : "N";
    this.detalle.filtrocla = this.detalle.filtropar ? this.detalle.filtropar : "N";
    let nuevo = true
    let sentencia = previa + previa2 + "INSERT INTO " + this.servicio.rBD() + ".consultas_cab (usuario, " + (id == 1 ? "nombre, " : "") + "publico, periodo, defecto, filtrolin, filtroori, filtromaq, filtroare, filtrofal, filtrotec, filtronpar, filtrotur, filtroord, filtropar, filtrooper, filtrocla" + (this.detalle.periodo != 8 ? ")" : ", desde, hasta, actualizacion)") + " VALUES (" + this.servicio.rUsuario().id + ", '" + (id == 1 ? this.detalle.nombre + "', '" : "") + this.detalle.publico + "', '" + this.detalle.periodo + "', '" + this.detalle.defecto + "', '" + this.detalle.filtrolin + "', '" + this.detalle.filtroori + "', '" + this.detalle.filtromaq + "', '" + this.detalle.filtroare + "', '" + this.detalle.filtrofal + "', '" + this.detalle.filtrotec + "', '" + this.detalle.filtronpar + "', '" + this.detalle.filtrotur + "', '" + this.detalle.filtroord + "', '" + this.detalle.filtropar + "', '" + this.detalle.filtrooper + "', '" + this.detalle.filtrocla + "'" + (this.detalle.periodo != 8 ? ");" : ", '" + this.servicio.fecha(2, this.detalle.desde, "yyyy/MM/dd") + "', '" +  this.servicio.fecha(2, this.detalle.hasta, "yyyy/MM/dd") + "', NOW());")
    if (+this.detalle.id > 0)
    {
      nuevo = false;
      sentencia = previa2 + "UPDATE " + this.servicio.rBD() + ".consultas_cab SET " + (id == 1 ? "nombre = '" + this.detalle.nombre + "', " : "") + "actualizacion = NOW(), publico = '" + this.detalle.publico + "', periodo = '" + this.detalle.periodo + "', defecto = '" + this.detalle.defecto + "', filtrolin = '" + this.detalle.filtrolin + "', filtroori = '" + this.detalle.filtroori + "', filtromaq = '" + this.detalle.filtromaq + "', filtroare = '" + this.detalle.filtroare + "', filtrofal = '" + this.detalle.filtrofal + "', filtrotec = '" + this.detalle.filtrotec + "', filtronpar = '" + this.detalle.filtronpar + "', filtrotur = '" + this.detalle.filtrotur + "', filtroord = '" + this.detalle.filtroord + "', filtropar = '" + this.detalle.filtropar + "', filtrooper = '" + this.detalle.filtrooper + "', filtrocla = '" + this.detalle.filtrocla + "'" + (this.detalle.periodo != 8 ? "" : ", desde = '" + this.servicio.fecha(2, this.detalle.desde, "yyyy/MM/dd") + "', hasta = '" +  this.servicio.fecha(2, this.detalle.hasta, "yyyy/MM/dd") + "' ") + " WHERE id = " + +this.detalle.id + ";";
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
      if (this.listaProcesos)
      {
        for (var i = 0; i < this.listaProcesos.selectedOptions.selected.length; i++) 
        {
          if (cadTablas.indexOf("(" + this.detalle.id + ", 90,  " + +this.listaProcesos.selectedOptions.selected[i].value + ")") == -1)
          {
            cadTablas = cadTablas + "(" + this.detalle.id + ", 90,  " + +this.listaProcesos.selectedOptions.selected[i].value + "),";
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
            this.aplicarConsulta(this.servicio.rConsulta());
            
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
            this.aplicarConsulta(this.servicio.rConsulta());
            
          }
      }
      
    })
    this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[3469]);
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "snack-normal";
    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2009]
    mensajeCompleto.tiempo = 2000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
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

  aplicarConsulta(id: number)
  {
    this.filtroAlarmas = "";
    this.ayuda01 = ""
    this.filtroParos = "";
    this.filtroFechas = "";
    this.filtroReportes = "";
    this.filtroOEE = "";
    this.filtroHXH = "";
    this.filtroWIP = "";
    this.filtroKRS = "";
    this.filtroSaldo = "";
    this.filtroMov = "";
    this.filtroK = "";
    this.filtroTrazabilidad = "";
    this.filtroCalidad = "";
    
    
    this.filtroFechasDia = "";
    
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".consultas_cab WHERE id = " + id
    if (id == 0)
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
        this.ayuda01 = this.servicio.rTraduccion()[2174] + (resp[0].nombre ? resp[0].nombre : this.servicio.rTraduccion()[2175]);
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
        this.filtroAlarmas = " a.inicio >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicio <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroParos = " AND f.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND f.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroFechas = " fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroReportes = " AND c.fecha_reporte >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND c.fecha_reporte <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroOEE = " AND c.dia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND c.dia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroHXH = " AND a.dia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND a.dia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        
        this.filtroFechasDia = " a.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND a.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroWIP = " AND a.inicia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroTrazabilidad = " AND a.fecha_entrada >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha_entrada <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroCalidad = " AND a.inicia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroKRS = " AND a.inicio >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicio <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroK = " AND a.fecha_sugerida >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha_sugerida <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroMov = " AND a.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        
        if (resp[0].filtroori == "0")
        {
          this.filtroReportes = this.filtroReportes + " AND c.origen = 0 "
        }
        else if (resp[0].filtroori == "1")
        {
          this.filtroReportes = this.filtroReportes + " AND c.origen > 0 "
        }
        if (resp[0].filtrolin == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroOEE = this.filtroOEE + " AND d.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
          this.filtroHXH = this.filtroHXH + " AND b.linea IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 10) "
        }
        if (resp[0].filtromaq == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.maquina IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroOEE = this.filtroOEE + " AND c.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroHXH = this.filtroHXH + " AND a.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroWIP = this.filtroWIP + " AND a.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroTrazabilidad = this.filtroTrazabilidad + " AND a.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
          this.filtroCalidad = this.filtroCalidad + " AND a.equipo IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 20) "
        }
        if (resp[0].filtroare == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroKRS = this.filtroKRS + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroK = this.filtroK + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroMov = this.filtroMov + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
          this.filtroSaldo = this.filtroSaldo + " AND a.area IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 30) "
        }
        if (resp[0].filtrofal == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.falla IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 40) "
        }
        if (resp[0].filtrotec == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.tecnico IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
          this.filtroKRS = this.filtroKRS + " AND a.usuario_asignado IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 50) "
        }     
        if (resp[0].filtronpar == "N")
        {
          this.filtroOEE = this.filtroOEE + " AND c.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroHXH = this.filtroHXH + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroWIP = this.filtroWIP + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroTrazabilidad = this.filtroTrazabilidad + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroCalidad = this.filtroCalidad + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroKRS = this.filtroKRS + " AND e.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroK = this.filtroK + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroMov = this.filtroMov + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
          this.filtroSaldo = this.filtroSaldo + " AND a.parte IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 60) "
        } 
        if (resp[0].filtrotur == "N")
        {
          this.filtroReportes = this.filtroReportes + " AND c.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroOEE = this.filtroOEE + " AND c.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroHXH = this.filtroHXH + " AND a.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroKRS = this.filtroKRS + " AND e.turno_entrega IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroK = this.filtroK + " AND a.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
          this.filtroMov = this.filtroMov + " AND a.turno IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 70) "
        }
        if (resp[0].filtroord == "N")
        {
          this.filtroOEE = this.filtroOEE + " AND c.orden IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroHXH = this.filtroHXH + " AND a.lote IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroWIP = this.filtroWIP + " AND a.id IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroTrazabilidad = this.filtroTrazabilidad + " AND a.lote IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
          this.filtroCalidad = this.filtroCalidad + " AND a.lote IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 80) "
        }
        if (resp[0].filtrooper == "N")
        {
          this.filtroWIP = this.filtroWIP + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroTrazabilidad = this.filtroTrazabilidad + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroCalidad = this.filtroCalidad + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroKRS = this.filtroKRS + " AND e.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroK = this.filtroK + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroMov = this.filtroMov + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
          this.filtroSaldo = this.filtroSaldo + " AND a.proceso IN (SELECT valor FROM " + this.servicio.rBD() + ".consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 90) "
        }
               
      } 
      else
      {
        this.ayuda01 = this.servicio.rTraduccion()[3458];
        let nuevaFecha = this.servicio.fecha(1, '' , "yyyy/MM") + "/01";         
        desde = new Date(nuevaFecha);
        this.filtroAlarmas = " a.inicio >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicio <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroParos = " AND f.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND f.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroFechas = " fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroReportes = " AND c.fecha_reporte >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND c.fecha_reporte <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroOEE = " AND c.dia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND c.dia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroHXH = " AND a.dia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND a.dia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroWIP = " AND a.inicia >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicia <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroKRS = " AND a.inicio >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicio <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroFechasDia = " a.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + "' AND a.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + "' ";
        this.filtroK = " AND a.fecha_sugerida >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha_sugerida <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
        this.filtroMov = " AND a.fecha >= '" + this.datepipe.transform(desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha <= '" + this.datepipe.transform(hasta, "yyyy/MM/dd") + " 23:59:59' ";
      }
    })
  }   
  
  revisarTiempo()
  {
    if (this.modelo == 13 || this.modelo == 3)
    {
      this.contarTiempo = false;
      for (var i = 0; i < this.registros.length; i++)
      {
        let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].inicio, "").split(";");
        this.arreTiempos[i] = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
      }
      this.contarTiempo = true;
    }
    else
    {
      this.cada5Seg = this.cada5Seg + 1;
      if (this.cada5Seg > 5)
      {
        this.rListado01();
        this.cada5Seg = 0;
      }
    }
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

  leerBD()
  {
    if ((this.modelo != 13 && this.modelo != 3) || this.router.url.substr(0, 9) != "/exportar")
    {
      return;
    }
    let sentencia = "";
    
    sentencia = "SELECT * FROM (SELECT a.*, b.evento, 0 AS indicador, c.estatus AS restatus, NOW() AS hasta, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, '' AS n1, '' AS n2 FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".reportes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.AREA = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios e ON c.solicitante = e.id WHERE ISNULL(fin) AND b.evento < 200 UNION ALL SELECT a.*, b.evento, CASE WHEN b.evento < 203 THEN c.rate ELSE c.oee END AS indicador, c.estatus AS restatus, NOW() AS hasta, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante, '' AS n1, '' AS n2 FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".relacion_maquinas_lecturas c ON a.proceso = c.equipo LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas d ON c.equipo = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_lineas e ON d.linea = e.id WHERE ISNULL(fin) AND b.evento > 200 AND b.evento < 300 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.hasta, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS producto, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, c.numero, e.referencia FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".lotes c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.proceso = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes e ON c.parte = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas f ON c.equipo = f.id WHERE ISNULL(fin) AND b.evento > 301 AND b.evento < 304 UNION ALL SELECT a.*, b.evento, 0 AS indicador, 0 AS restatus, c.fecha, b.nombre, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nequipo, c.carga, '' FROM " + this.servicio.rBD() + ".alarmas a LEFT JOIN " + this.servicio.rBD() + ".cat_alertas b ON a.alerta = b.id LEFT JOIN " + this.servicio.rBD() + ".cargas c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos d ON c.proceso = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas f ON c.equipo = f.id WHERE ISNULL(fin) AND b.evento = 304) AS qry01 ORDER BY inicio;";
    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      let actualizar = JSON.stringify(this.registros) != JSON.stringify(resp);
      if (actualizar)
      {
        if (resp.length == 0)
        {
          this.registros = [];
        }
        if (this.registros.length == 0 && resp.length > 0)
        {
          this.registros = resp;
        }
        else 
        {
          for (i = this.registros.length - 1; i >= 0; i--)
          {
            let hallado = false;
            for (var j = 0; j < resp.length; j++)
            {

              if (this.registros[i].id ==  resp[j].id)
              {
                if (this.registros[i].indicador !=  resp[j].indicador || this.registros[i].restatus !=  resp[j].restatus || this.registros[i].hasta !=  resp[j].hasta || this.registros[i].fase != resp[j].fase)
                {
                  this.registros[i].indicador = resp[j].indicador;
                  this.registros[i].hasta = resp[j].hasta;
                  this.registros[i].restatus = resp[j].restatus;
                  this.registros[i].fase = resp[j].fase;
                }
                hallado = true;
                break;
              }
            }
            if (!hallado)
            {
              this.registros.splice(i, 1);
              this.arreTiempos.length = resp.length;
              this.arreHover.length = resp.length;
            }
          }
          for (var i = 0; i < resp.length; i++)
          {
            let agregar = true;
            for (var j = 0; j < this.registros.length; j++)
            {
              if (this.registros[j].id == resp[i].id)
              {
                agregar = false
                break;              
              }
            }
            if (agregar)
            {
              this.registros.splice(i, 0, resp[i])
              this.arreTiempos.length = resp.length;
              this.arreHover.length = resp.length;
            }
          }
          
        }
        this.contarRegs()
      }
      clearTimeout(this.leeBD);
      if (this.router.url.substr(0, 9) == "/exportar")
      {
        this.leeBD = setTimeout(() => {
          this.leerBD()
        }, +this.elTiempo);
      }
    });
  }

  contarRegs()
  {
    if (this.router.url.substr(0, 9) != "/exportar")
    {
      return;
    }
    if (this.modelo == 1)
    {
      this.servicio.mensajeInferior.emit(this.servicio.rTraduccion()[2015]);   
      return;
    }
    let mensaje = "";
    if (this.registros.length > 0)
    {
      mensaje = this.servicio.rTraduccion()[66] + (this.registros.length == 1 ? this.servicio.rTraduccion()[2176] : this.registros.length + this.servicio.rTraduccion()[2177]) 
    }
    else
    {
      mensaje = this.servicio.rTraduccion()[2178];
    }
    let cadAlarmas: string = "";
    this.alarmados = 0;
    for (var i = 0; i < this.registros.length; i++)
    {
      if (this.registros[i].fase >10)
      {
        this.alarmados = this.alarmados + 1
      }
    }
    if (this.alarmados > 0)
    {
      cadAlarmas = "<span class='resaltar'>" + (this.alarmados == 1 ? this.servicio.rTraduccion()[2179] : this.alarmados + this.servicio.rTraduccion()[2180]) + "</span>";
    }
    mensaje = mensaje + ' ' + cadAlarmas

    this.servicio.mensajeInferior.emit(mensaje);          
  }


  cancelarAlarmas()
  {
    let sentencia = "SELECT a.*, c.informar_resolucion, c.evento FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".cat_alertas c ON a.alerta = c.id WHERE ISNULL(a.fin)"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        sentencia = "";
        for (var i = 0; i < resp.length; i++) 
        {
            sentencia =  sentencia + ";UPDATE " + this.servicio.rBD() + ".reportes SET alarmado_atender = 'Y' WHERE id = " + resp[i].proceso;
            if (+resp[i].evento == 102) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".reportes SET alarmado_atendido = 'Y' WHERE id = " + resp[i].proceso;
            }
            else if (+resp[i].evento == 103) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".reportes SET alarmado = 'Y' WHERE id = " + resp[i].proceso;
            } 
            else if (+resp[i].evento == 302) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".lotes SET alarma_tse_paso = 'N', alarma_tse = 'N', alarma_tse_p = 'N' WHERE id id = " + resp[i].proceso;
            }
            else if (+resp[i].evento == 303) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".lotes SET alarma_tpe_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N' WHERE id = " + resp[i].proceso;
            } 
            else if (+resp[i].evento == 201) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_bajo = 'N' WHERE equipo = " + resp[i].proceso;
            } 
            else if (+resp[i].evento == 202) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_alto = 'N' WHERE AND equipo = " + resp[i].proceso;
            } 
            else if (+resp[0].evento == 204) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_ftq = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 205) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_dis = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 206) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_efi = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            else if (+resp[0].evento == 207) 
            {
              sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".relacion_maquinas_lecturas SET alarmado_oee = 'N' WHERE equipo = " + resp[0].proceso;
            }  
            sentencia = sentencia + ";UPDATE " + this.servicio.rBD() + ".alarmas SET estatus = 9, fin = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicio))" + (resp[i].informar_resolucion == "S" ? ", informado = 'S'" : "") + ", termino = " + this.servicio.rUsuario().id + " WHERE id = " + resp[i].id + ";UPDATE " + this.servicio.rBD() + ".mensajes SET estatus = 'Z' where alarma = " + resp[i].id;
            if (resp[0].informar_resolucion == "S")
            {
              sentencia = sentencia + ";INSERT INTO " + this.servicio.rBD() + ".mensajes (alerta, canal, tipo, proceso, alarma, lista) SELECT a.alerta, b.canal, 7, a.proceso, a.id, b.lista FROM " + this.servicio.rBD() + ".alarmas a INNER JOIN " + this.servicio.rBD() + ".mensajes b ON a.id = b.alarma WHERE a.id = " + resp[i].id + " AND a.estatus = 9  GROUP BY a.alerta, b.canal, a.proceso, a.id, b.lista";
            }
          }
          sentencia = sentencia.substr(1);
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[2014]
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.leerBD();
            this.contarRegs(); 
            this.noLeer = false;   
          })
        }
      });
                    
  }
  siguienteCancelar()
  {

    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[2181], mensaje: this.servicio.rTraduccion()[2182], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[2183], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result)
      {
        
        if (result.accion == 1) 
        {
          if (this.yaConfirmado)
          {
            this.cancelarAlarmas();
          }
          else
          {

            const respuesta = this.dialogo.open(SesionComponent, 
            {
              width: "400px", panelClass: 'dialogo_atencion', data: { tiempo: 10, sesion: 1, rolBuscar: "A", opcionSel: 0, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[2184], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
            });
            respuesta.afterClosed().subscribe(result => 
            {
              if (result)
              {
                if (result.accion == 1) 
                {
                  this.cancelarAlarmas();  
                }
                else
                {
                  let mensajeCompleto: any = [];
                  mensajeCompleto.clase = "snack-error";
                  mensajeCompleto.mensaje = this.servicio.rTraduccion()[2011]
                  mensajeCompleto.tiempo = 2000;
                  this.servicio.mensajeToast.emit(mensajeCompleto);
                }
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[2012]
                mensajeCompleto.tiempo = 2000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })
            }
          }        
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[2011]
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[2011]
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }
}