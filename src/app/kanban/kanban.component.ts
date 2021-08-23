import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
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



export class KanbanComponent implements OnInit {

  

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("txtNotas", { static: false }) txtNotas: ElementRef;
  @ViewChild("txtT1", { static: false }) txtT1: ElementRef;
  @ViewChild("txtT10", { static: false }) txtT10: ElementRef;
  @ViewChild("txtT9", { static: false }) txtT9: ElementRef;
  @ViewChild("lstC10", { static: false }) lstC10: MatSelect;
  @ViewChild("lstC11", { static: false }) lstC11: MatSelect;
  @ViewChild("abotones", { static: false }) mBotones: ElementRef;
  
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
    private viewportRuler: ViewportRuler
  ) {

    this.emit00 = this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 92;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 2;// - (pantalla ? 0 : this.servicio.rAnchoSN());// : 0);
      this.calcularElementos();
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
      this.verPanel = false;
      if (accion == 2510 || accion == 2520)
      {
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        
        this.servicio.mostrarBmenu.emit(0);
        this.vistaOperador = accion == 2510 ; 
        this.enTecnico = !this.vistaOperador;
        this.miSeleccion = this.vistaOperador ? 1 : 11;  
        this.rConfiguracion();
        if ((this.servicio.rUsuario().preferencias_andon.substr(0, 1) == "1" && this.vistaOperador) || (this.servicio.rUsuario().preferencias_andon.substr(5, 1) == "1" && !this.vistaOperador))
        {
          //this.modelo = this.modelo == 2 ? 2 : 12;
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
          if (this.miSeleccion != 15)
          {
            this.miSeleccion = 11;
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
      else if (accion == 2530)
      {
        this.iniciado = true;
        this.modelo = 3;
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        this.miSeleccion = 100;
        this.iconoVista = "i_vdetalle"
        this.tituloBuscar = this.servicio.rTraduccion()[4017];
        this.verTabla = true;
        this.mostrarDetalle = true; 
        this.rRegistros(this.miSeleccion);
      }
      else if (accion == 2540)
      {
        this.modelo = 3;
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        this.miSeleccion = 200;
        this.iconoVista = "i_vdetalle"
        this.tituloBuscar = this.servicio.rTraduccion()[4017];
        this.verTabla = true;
        this.mostrarDetalle = true; 
        this.rRegistros(this.miSeleccion);
      }
    });
    this.emit60 = this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 7) == "/kanban" && (this.enTecnico || this.miSeleccion==15 || this.miSeleccion==200 || this.miSeleccion==210))
      {
        this.cadaSegundo();
      }
    });
    this.escaner = this.servicio.escaneado.subscribe((cadena: string)=>
    {
      //Se escane a el lote
      this.servicio.aEscanear(false);
      this.validarEntrada(cadena)
      this.textoBuscar = "";
      cadena = "";
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
    this.laSeleccion[4] = "['" + this.servicio.rTraduccion()[3905] + "']";
    this.laSeleccion[5] = "['" + this.servicio.rTraduccion()[3906] + "']";
    this.laSeleccion[6] = "['" + this.servicio.rTraduccion()[4] + "']";
    this.laSeleccion[7] = "['" + this.servicio.rTraduccion()[5] + "']";
    this.laSeleccion[8] = "";
    this.laSeleccion[9] = "";
    this.laSeleccion[10] = "";
    this.laSeleccion[11] = "";
    
    if (this.servicio.rVista() == 2510)
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
    else if (this.servicio.rVista() == 2520)
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
    else if (this.servicio.rVista() == 2530)
      {
        this.iniciado = true;
        this.modelo = 3;
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        this.miSeleccion = 100;
        this.tituloBuscar = this.servicio.rTraduccion()[4017];
        this.verTabla = true;
        this.mostrarDetalle = true;  
        this.rRegistros(this.miSeleccion);
        
      }
      else if (this.servicio.rVista() == 2540)
      {
        this.modelo = 3;
        this.yaVer = false;
        this.registros = [];
        this.arrFiltrado = [];
        this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
        this.miSeleccion = 200;
        this.tituloBuscar = this.servicio.rTraduccion()[4017];
        this.verTabla = true;
        this.mostrarDetalle = true;  
        this.rRegistros(this.miSeleccion);
        
      }
    this.rConfiguracion();
    
  }

  ngOnInit() {

    this.servicio.validarLicencia(1)
    this.servicio.mostrarBmenu.emit(0);    
    this.servicio.mensajeTurno.emit(this.servicio.rTurno().nombre);
    this.calcularElementos()
    if (this.miSeleccion < 100 )
    {
      this.servicio.aEscanear(true);
    }
  }

  ngOnDestroy() 
  {
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
  escaner: Subscription;

  pTipo_surtido: string = ""; 
  pAreaSurtir: number = 0; 
  mmcallAreaSurtir: string = ""; 
  cantidadNegativa: number = 0; 
  idBuscar: number = 0;
  notasNegativa: string = ""; 
  causaNegativa: number = 0; 
  ordenNegativa: number = 0;
  filtroActual: number = 0; 
  cAreaSurtir: string = ""; 
  pSobreStock: string = ""; 
  noNumerosParte: string = ""; 
  eTipo_surtido: string = ""; 
  sMaximo: string = "";
  cTipo_surtido: string = ""; 
  areaSurtir: number = 0;
  prioridadP: number = 999999;
  prioridadN: number = 999999;
  anchoTitulo: number = this.servicio.rPantalla().ancho - 10 + this.servicio.rAnchoSN();;
  verPanel: boolean = true;
  
  local: string = "";
  cantidadPedir: number = 0;
  unidadTexto: string = "";
  cantidadPedirT: string = "";
  cantidadPedirC: string = "";
  nombreProceso: string = "";
  nombreParte: string = "";
  existencia: number = 0;
  cadFiltro: string = "";
  tUso: number = 0;
  tLimite: number = 0;
  tTexto: string = "";
  saldo: number = 0;
  tiempo_estimado: number = 0;
  
  clavePublica: string = "";
  claveInterna: string = "";
  rutaCabecera: number = 0;
  rutaCabeceraNombre: string = "";
  uAsignado: string = "";
  respetar_secuencia: string = "";
  linea_siguiente: number = 0;
  lineas_completadas: number = 0;
  total_lineas: number = 0;
  cadAvance: string = "";
  tipo: string = "";
  offSet: number;
  confirmador: number = 0;
  tEnviados: number = 0;
  noLicenciados: number = 0;
  secuencia: number = 0;
  areas: any = [];
  verIrArriba: boolean = false;
  iniciado: boolean = false;
  parametroVista: number = 0;
  indicePreferencia: number = 0;
  hayManual: boolean = false;
  cincoW: boolean = false;
  kanbanDetalle: boolean = false;
  iniciadoFondo: boolean = false;
  cr: boolean = false;
  afecta_oee: string = "N";
  palabraClave: string = "CronosIntegracion2019";
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
  filtrarInventario: number = 0;
  filtrarInventarioPor: number = 0;
  filtrarInventarioPorDes: string = "";
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
  arreDemas: any = [];
  arreHover: any = [];
  detalle: any = [];
  hoverp: any = [];
  causaraiz: any = [];
  notas: string = "";
  reporteSeleccionado: number = 0;
  maquinaSeleccionado: string = 'N';
  enTecnico: boolean = false;
  noLeer: boolean = false;
  operacioSel: boolean = false;
  vistaOperador: boolean = true;
  todos: boolean = false;
  maquinaSel: boolean = false;
  reparandoSel: boolean = false;
  abiertoSel: boolean = false;
  lineaSel: boolean = false;
  editando: boolean = false;

  rsaAlarmado: number = 0;
  rerAlarmado: number = 0;
  ralAlarmado: number = 0;

  faltaMensaje: string = "";
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
      this.modelo = this.modelo == 13 ? 3 : this.modelo == 12 ? 2 : this.modelo;
      
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
    this.iconoGeneral = "i_procesos";
    this.rRegistros(1);
    this.miSeleccion = 1;
  }

  botones(accion: boolean)
  {
    if (this.boton11 == accion)
  this.boton11 = accion;
  }

  valAtender()
  {
    if (this.configuracion.kanban_atencion_llamada == "S") 
    {
      this.servicio.aEscanear(false); 
      this.servicio.cambioOpcion.emit(2520);
    }
    else
    {
      this.validarOpcion(11, "0", 0, 0);
    }
  }

  rRegistros(tabla: number)
  {
    this.miSeleccion = tabla;
    if (this.iniciado)
    {
      this.verPanel = false;
    }
    if (tabla >= 100 && tabla < 200)
    {
      this.servicio.aEscanear(false);
    }
    this.totales();
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
      this.indicePreferencia = 81;
      if (this.iniciado)
      {
        this.modelo = this.modelo < 10 ? this.modelo + 10 : this.modelo;
      }
      sentencia = "SELECT a.id, a.nombre, a.imagen, 'S' AS mostrarImagen, a.kanban_area, a.kanban_permitir_sobre_stock, a.kanban_tipo_surtido, a.kanban_parametros, a.kanban_prioridad FROM " + this.servicio.rBD() + ".cat_procesos a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 0 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.kanban = 'S' AND a.kanban_manual = 'S' ORDER BY a.nombre;"
      if (this.servicio.rUsuario().operacion=="S")
      {
        sentencia = "SELECT a.id, a.nombre, a.imagen, 'S' AS mostrarImagen, a.kanban_area, a.kanban_permitir_sobre_stock, a.kanban_tipo_surtido, a.kanban_parametros, a.kanban_prioridad FROM " + this.servicio.rBD() + ".cat_procesos a WHERE a.estatus = 'A' AND a.kanban = 'S' AND a.kanban_manual = 'S' ORDER BY a.nombre;"
      }      
      this.literalSingular = this.servicio.rTraduccion()[3889];
      this.literalPlural = this.servicio.rTraduccion()[3890];
      this.literalSingularArticulo = this.servicio.rTraduccion()[3891];
      this.mensajePadre = "";
    }
    else if (tabla == 2)
    {
     
      this.indicePreferencia = 82;
      if (this.iniciado)
      {
        this.modelo = this.modelo < 10 ? this.modelo + 10 : this.modelo;
      }
      
      sentencia = "SELECT b.kanban_manual, 0 AS ccambiada, a.parte AS id, b.nombre, a.por_surtir, b.referencia, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntipo, a.limite, a.enuso, IFNULL(d.url_mmcall, '') AS nunidade, IFNULL(e.url_mmcall, '') AS nunidadn, 0 AS pedido, a.parte_parametros, a.permitir_sobre_stock, a.tiempo_estimado, a.punto_reorden, a.stock_maximo, a.lote_minimo, a.siguiente_lote, b.kanban_tiempo_estimado, b.kanban_punto_reorden, b.kanban_stock_maximo, b.kanban_lote_minimo, b.kanban_siguiente_lote, a.saldo, a.kanban_parametros, a.area, a.tipo_surtido, a.limite, a.enuso, b.imagen, b.kanban_prioridad, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id AND a.proceso = " + +this.laSeleccion[0] + " LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON b.tipo_componente = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales d ON a.unidad = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON b.kanban_unidad = e.id WHERE (b.kanban_manual = 'S' AND a.parte_parametros = 'P') OR (a.manual = 'S' AND a.parte_parametros = 'E') ORDER BY b.nombre;"
            
      this.mensajePadre = this.servicio.rTraduccion()[3892] + " " + this.laSeleccion[4];
      this.literalSingular = this.servicio.rTraduccion()[3893];
      this.literalPlural = this.servicio.rTraduccion()[3894];
      this.literalSingularArticulo = this.servicio.rTraduccion()[3895];
    }

    else if (tabla == 100)
    {
      let adicional = "";
      this.mensajePadre = "";
      if (this.filtrarInventario == 1)
      {
        adicional = " WHERE proceso = " + this.filtrarInventarioPor
        this.mensajePadre = this.servicio.rTraduccion()[4054] + " " + this.filtrarInventarioPorDes;
      }
      else if (this.filtrarInventario == 2)
      {
        adicional = " WHERE parte = " + this.filtrarInventarioPor
        this.mensajePadre = this.servicio.rTraduccion()[4059] + " " + this.filtrarInventarioPorDes;
      }
      sentencia = "SELECT a.id, a.parte, a.proceso, a.punto_reorden, b.kanban_punto_reorden, IFNULL(b.nombre, '') AS nparte, IFNULL(f.nombre, '') AS narea, IFNULL(g.nombre, '') AS nareap, a.por_surtir, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(d.nombre , '')  AS nunidad, IFNULL(d.url_mmcall, '') AS nunidadn, a.parte_parametros, a.punto_reorden, b.kanban_punto_reorden, a.saldo, a.kanban_parametros, a.area, a.tipo_surtido, a.limite, a.enuso, b.imagen, b.kanban_prioridad, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales d ON a.unidad = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON b.kanban_unidad = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas f ON a.area = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas g ON c.kanban_area = g.id " + adicional + " ORDER BY b.nombre, c.nombre;"
      this.miSeleccion = 100;
      
      this.literalSingular = this.servicio.rTraduccion()[4055];
      this.literalPlural = this.servicio.rTraduccion()[4056];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4057];
      this.iconoGeneral = "i_produccion";
      this.verTabla = false;
    }
    else if (tabla == 110)
    {
      this.indicePreferencia = 84;
      if (this.iniciado)
      {
        this.modelo = this.modelo >= 10 ? 3 : 13;;
      }
      sentencia = "SELECT a.proceso, IFNULL(g.nombre, '') AS narea, SUM(a.por_surtir) AS por_surtir, SUM(a.saldo) AS saldo, COUNT(*) AS items, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, c.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_procesos c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas f ON a.area = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas g ON c.kanban_area = g.id GROUP  BY c.nombre;"
      this.miSeleccion = 110;
      this.mensajePadre = "";
      this.literalSingular = this.servicio.rTraduccion()[4055];
      this.literalPlural = this.servicio.rTraduccion()[4056];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4057];
      this.iconoGeneral = "i_procesos";
      this.verTabla = true;
    }
    else if (tabla == 120)
    {
      this.indicePreferencia = 85;
      if (this.iniciado)
      {
        this.modelo = this.modelo >= 10 ? 3 : 13;;
      }
      sentencia = "SELECT a.parte, SUM(a.por_surtir) AS por_surtir, SUM(a.saldo) AS saldo, COUNT(*) AS items, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, IFNULL(e.url_mmcall, '') AS nunidad, c.imagen, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales d ON a.unidad = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON c.kanban_unidad = e.id GROUP BY c.nombre;"
      this.miSeleccion = 120;
      this.mensajePadre = "";
      this.literalSingular = this.servicio.rTraduccion()[4055];
      this.literalPlural = this.servicio.rTraduccion()[4056];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4057];
      this.iconoGeneral = "i_partes";
      this.verTabla = true;
    }
    else if (tabla == 130)
    {
      sentencia = "SELECT a.fecha, a.clase, a.tipo, a.notas, a.referencia, a.cantidad, a.saldo_ubicacion_antes, a.unidad, a.tarjeta_texto, a.tipo_surtido, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ncausa FROM " + this.servicio.rBD() + ".kanban_movimientos a LEFT JOIN " + this.servicio.rBD() + ".cat_generales b ON a.causa = b.id " + this.cadFiltro + " ORDER BY a.id DESC LIMIT 200;"
      this.miSeleccion = 130;
      this.mensajePadre = "";
      this.literalSingular = this.servicio.rTraduccion()[4090];
      this.literalPlural = this.servicio.rTraduccion()[4091];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4092];
      this.iconoGeneral = "i_produccion";
      this.verTabla = true;
    }
    else if (tabla == 200)
    {
      if (this.iniciado)
      {
        this.modelo = this.modelo >= 10 ? 3 : 13;;
      }
      this.cadFiltro = "";
      sentencia = "SELECT a.id, a.nombre, a.estatus, a.linea_siguiente, a.respetar_secuencia, a.lineas_completadas, a.total_lineas, a.fecha_siguiente, a.tipo, a.alarmado, a.estado, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nusuario, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[4181] + "' WHEN a.estado = 5 THEN '" + this.servicio.rTraduccion()[4182] + "' WHEN a.estado = 10 THEN '" + this.servicio.rTraduccion()[3535] + "' WHEN a.estado = 20 THEN '" + this.servicio.rTraduccion()[2275] + "' WHEN a.estado = 50 THEN '" + this.servicio.rTraduccion()[1018] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[4183] + "' END AS nestado FROM " + this.servicio.rBD() + ".rkanban_cab a INNER JOIN " + this.servicio.rBD() + ".rkanban_det c ON a.id = c.kanban AND a.linea_siguiente = c.secuencia LEFT JOIN " + this.servicio.rBD() + ".cat_areas b ON a.area = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON c.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON c.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.usuario_asignado = f.id WHERE a.estado < 50 ORDER BY a.fecha_siguiente ASC;";
      this.miSeleccion = 200;
      this.mensajePadre = "";
      this.tituloBuscar = this.servicio.rTraduccion()[4184];
      this.literalSingular = this.servicio.rTraduccion()[4178];
      this.literalPlural = this.servicio.rTraduccion()[4179];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4179];
      this.iconoGeneral = "i_rutas_kanban";
      this.verTabla = true;
    }
    else if (tabla == 210)
    {
      this.servicio.aEscanear(true);
      if (this.iniciado)
      {
        this.modelo = this.modelo >= 10 ? 3 : 13;;
      }
        
      this.cadFiltro = "";
      sentencia = "SELECT a.kanban, a.secuencia, a.parte, TIMEDIFF(a.ejecutado, a.planeado) AS ttiempo, d.imagen, 'S' AS mostrarImagen, a.estado, a.cantidad_solicitada, a.planeado, a.alarmado, a.estado, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nunidad, IFNULL(f.url_mmcall, '" + this.servicio.rTraduccion()[8] + "') AS nunidadc, CASE WHEN a.estado = 0 THEN '" + this.servicio.rTraduccion()[4182] + "' WHEN a.estado = 5 THEN '" + this.servicio.rTraduccion()[4211] + "' WHEN a.estado = 10 THEN '" + this.servicio.rTraduccion()[3536] + "' WHEN a.estado = 90 THEN '" + this.servicio.rTraduccion()[4183] + "' END AS nestado FROM " + this.servicio.rBD() + ".rkanban_det a LEFT JOIN " + this.servicio.rBD() + ".cat_partes d ON a.parte = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_procesos e ON a.proceso = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales f ON d.kanban_unidad = f.id WHERE a.kanban = " + this.rutaCabecera + " ORDER BY a.secuencia;";
      this.miSeleccion = 210;
      this.mensajePadre = this.servicio.rTraduccion()[4215] + " " + this.rutaCabecera;
      this.tituloBuscar = this.servicio.rTraduccion()[4212];
      this.literalSingular = this.servicio.rTraduccion()[4213];
      this.literalPlural = this.servicio.rTraduccion()[4214];
      this.literalSingularArticulo = this.servicio.rTraduccion()[4179];
      this.iconoGeneral = "i_partes";
      this.verTabla = true;
    }
    else if (tabla == 11 || tabla == 15 )
    {
      this.modelo = this.modelo >= 10 ? 3 : 13;  
      this.indicePreferencia = tabla == 11 ? 86 : 87;
      this.miSeleccion = tabla;
      this.registros = [];
      this.arrFiltrado = [];
      this.arreHover = [];
      this.sondeo = 0;
      this.contarTiempo = false;
      let filtroLinea = ""
      if (this.servicio.rUsuario().operacion!="S")
      {
        filtroLinea = " AND a.operacion IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_operaciones_partes WHERE usuario = " + this.servicio.rUsuario().id + ") ";
      } 
      let filtroArea = ""
      if (tabla == 11)
      {
        if (this.servicio.rUsuario().area != "S")
        {
          filtroArea = " AND a.area IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 3 AND usuario = " + this.servicio.rUsuario().id + ") ";
        }
        this.tituloBuscar = this.servicio.rTraduccion()[3873];
        this.literalSingular = this.servicio.rTraduccion()[3982];
        this.literalPlural = this.servicio.rTraduccion()[3983];
        this.literalSingularArticulo = this.servicio.rTraduccion()[3984];
        this.iconoGeneral = "i_produccion";

        //cálculo de los filtros
        
        sentencia = "SELECT a.id, a.estado, a.alarmado, a.tipo_surtido, a.cantidad_solicitada, a.fecha_solicitud AS fechac, a.fecha_sugerida, a.lead_time, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, c.referencia, a.unidadtexto AS nunidad, c.imagen, 'S' AS mostrarImagen, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante FROM " + this.servicio.rBD() + ".kanban_solicitudes a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON c.tipo = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estado <= 10 " + filtroLinea + " " + filtroArea + " ORDER BY a.prioridad_operacion, a.prioridad_parte, a.fecha_solicitud ";
        this.ayudaANDON = this.servicio.rTraduccion()[3985]
      }
      else if (tabla == 15)
      {
        
        this.tituloBuscar = this.servicio.rTraduccion()[3873];
        this.literalSingular = this.servicio.rTraduccion()[3880];
        this.literalPlural = this.servicio.rTraduccion()[3881];
        this.literalSingularArticulo = this.servicio.rTraduccion()[3882];
        this.iconoGeneral = "i_produccion";
        sentencia = "SELECT a.id, a.estado, a.alarmado, a.tipo_surtido, a.cantidad_solicitada, a.fecha_solicitud AS fechac, a.fecha_sugerida, a.lead_time, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nproceso, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nparte, c.referencia, a.unidadtexto AS nunidad, c.imagen, 'S' AS mostrarImagen, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS narea, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante FROM " + this.servicio.rBD() + ".kanban_solicitudes a LEFT JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON a.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON c.tipo = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON a.solicitante = f.id WHERE a.estado <= 10 " + filtroLinea + " " + filtroArea + " ORDER BY a.prioridad_operacion, a.prioridad_parte, a.fecha_solicitud ";
        this.ayudaANDON = this.servicio.rTraduccion()[3985];
        this.ayudaANDON = this.servicio.rTraduccion()[3985];
        this.ayudaANDON = this.servicio.rTraduccion()[3875];
      }
    } 
    this.hayManual = false;
    this.cadSQLActual = sentencia;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      setTimeout(() => {
        this.verPanel = true;
      }, 300);
      this.idBuscar = 0
      this.botones(true);
      if (tabla == 130)
      {
        if (resp.length >= 200)
        {
          this.literalPlural = this.literalPlural + " " + this.servicio.rTraduccion()[4093];
        }
        for (let i = 0;i < resp.length; i++)
        {
          resp[i].balance = this.existencia;
           this.existencia = this.existencia - resp[i].cantidad;
        }
      }
      else if (tabla == 210)
      {
        for (let i = 0;i < resp.length; i++)
        {
          if (resp[i].estado < 10)
          {
            this.idBuscar = i;
            if (this.idBuscar > 0)
            {
              this.llegoUltimo();
            }
            break;
          }
        }
      }
      else if (tabla == 1)
      {
        this.iconoGeneral = "i_procesos";
        this.tituloBuscar = this.servicio.rTraduccion()[3907];
        this.ayudaANDON = this.servicio.rTraduccion()[3903]
        this.cambiarVista(0);
      }
      else if (tabla == 2)
      {
        this.registros = [];
        this.iconoGeneral = "i_partes";
        this.tituloBuscar = this.servicio.rTraduccion()[3908];
        this.ayudaANDON = this.servicio.rTraduccion()[3904]        
        for (var i = 0; i < resp.length; i++) 
        {
          if (resp[i].kanban_parametros == "E")
          {
            this.eTipo_surtido = resp[i].tipo_surtido;
            resp[i].kanban_par = "E";
            resp[i].kanban_sminimo = resp[i].permitir_sobre_stock;
          }
          else if (resp[i].kanban_parametros == "P")
          {
            this.eTipo_surtido = this.pTipo_surtido;
            resp[i].kanban_par = "P";
            resp[i].kanban_sminimo = resp[i].permitir_sobre_stock;
          }
          else
          {
            this.eTipo_surtido = this.cTipo_surtido;
            resp[i].kanban_par = "C";
          }

          resp[i].stock_maximo = resp[i].parte_parametros == "E" ? +resp[i].stock_maximo : +resp[i].kanban_stock_maximo;
          resp[i].punto_reorden = resp[i].parte_parametros == "E" ? +resp[i].punto_reorden : +resp[i].kanban_punto_reorden;
          resp[i].lote_minimo = resp[i].parte_parametros == "E" ? +resp[i].lote_minimo : +resp[i].kanban_lote_minimo;
          resp[i].siguiente_lote = resp[i].parte_parametros == "E" ? +resp[i].siguiente_lote : +resp[i].kanban_siguiente_lote;
          resp[i].tiempo_estimado = resp[i].parte_parametros == "E" ? +resp[i].tiempo_estimado : +resp[i].kanban_tiempo_estimado;
          resp[i].nunidad = resp[i].parte_parametros == "E" ? resp[i].nunidade : resp[i].nunidadn;
          resp[i].pedidoC = this.eTipo_surtido;
          resp[i].tipo_surtido = this.eTipo_surtido;
          
          if (+resp[i].por_surtir > 0)
          {
            resp[i].tooltip = this.servicio.rTraduccion()[4006] + ": " + resp[i].por_surtir * 1 + " " + resp[i].nunidad;
          }
          if (this.eTipo_surtido == "M")
          {
            this.hayManual = true;
            //Aperturar una caja de texto;
            resp[i].pedido = +resp[i].stock_maximo - +resp[i].saldo - +resp[i].por_surtir;
            resp[i].pedido = +resp[i].pedido <= 0 ? 0 : +resp[i].pedido;
          }
          else if (this.eTipo_surtido == "S")
          {
            //Desde etiqueta;
            resp[i].pedido = +resp[i].stock_maximo - +resp[i].saldo - +resp[i].por_surtir;
            resp[i].pedido = +resp[i].pedido <= 0 ? 0 : +resp[i].pedido;
          
          }
          else if (this.eTipo_surtido == "A")
          {
            //Desde stock maximo;
            resp[i].pedido = +resp[i].saldo + +resp[i].por_surtir- +resp[i].punto_reorden;
            if (+resp[i].pedido >= 0)
            {
              resp[i].pedido = this.servicio.rTraduccion()[3925];
            }
            else
            {
              resp[i].pedido = +resp[i].stock_maximo - +resp[i].saldo - +resp[i].por_surtir;
              resp[i].pedido = +resp[i].pedido <= 0 ? 0 : +resp[i].pedido;
            }
            
          }
          else if (this.eTipo_surtido == "T")
          {
            //Desde tarjeta;
            resp[i].pedido = +resp[i].limite - +resp[i].enuso;
            resp[i].pedido = +resp[i].pedido <= 0 ? 0 : 1;
          }
          if (+resp[i].pedido > 0 && this.eTipo_surtido != "T")
          {
            resp[i].pedidoC = resp[i].pedidoC + (+resp[i].lote_minimo > 0 ? "S" : "N");
            resp[i].pedidoC = resp[i].pedidoC + (+resp[i].siguiente_lote > 0 ? "S" : "N");
            if (resp[i].pedido < resp[i].lote_minimo && +resp[i].lote_minimo > 0)
            {
              resp[i].pedido = +resp[i].lote_minimo;
              
            }
            else if (resp[i].pedido > resp[i].lote_minimo && +resp[i].siguiente_lote > 0)
            {
              let cantiRev = +resp[i].pedido  - +resp[i].lote_minimo;
              let vecesLS = cantiRev % +resp[i].siguiente_lote > 0 ? (Math.floor(cantiRev / +resp[i].siguiente_lote) + 1) * +resp[i].siguiente_lote : (cantiRev / +resp[i].siguiente_lote) * +resp[i].siguiente_lote;

              resp[i].pedido = +resp[i].lote_minimo + vecesLS;
            }         
            resp[i].pedidoTexto = resp[i].pedido != this.servicio.rTraduccion()[3925] ? (resp[i].pedido * 1 + ' ' + resp[i].nunidad) : resp[i].pedido;   
          }
          else if (this.eTipo_surtido == "T")
          {
            if (+resp[i].enuso == resp[i].limite)
            {
              resp[i].pedidoTexto = this.servicio.rTraduccion()[4004];
            }
            else
            {
              resp[i].pedidoTexto = resp[i].pedido != this.servicio.rTraduccion()[3925] ? ((+resp[i].enuso + 1) + " " + this.servicio.rTraduccion()[3996] + " " + +resp[i].limite) : resp[i].pedido;
            }
          }
          else
          {
            resp[i].pedidoTexto = resp[i].pedido != this.servicio.rTraduccion()[3925] ? (resp[i].pedido * 1 + ' ' + resp[i].nunidad) : resp[i].pedido;   
          }
          if (+resp[i].pedido > 0 || this.configuracion.kanban_ver_no_requerido == "S" )
          {
            this.registros.splice(this.registros.length, 0, resp[i]);
          }
          resp[i].barcode = "https://api.qrserver.com/v1/create-qr-code/?data='" + resp[i].referencia + "," + resp[i].pedido + "'&amp;size=70x70";

        }
        if (this.registros.length == 0)
        {
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
          this.laSeleccion[9] = ""; 
          this.noNumerosParte = this.servicio.rTraduccion()[3919] + (this.configuracion.kanban_ver_no_requerido == 'N' ? "<br>" + this.servicio.rTraduccion()[3932] : ''); 
        } 
        else if (this.registros.length == 1)
        {
          this.laSeleccion[1] = resp[0].id;
          this.laSeleccion[5] = resp[0].nombre;
          this.laSeleccion[9] = resp[0].url_mmcall;
          
        }
        this.cambiarVista(0);
      }
      else if (tabla == 100)
      {
        for (var i = 0; i < resp.length; i++) 
        {
          //resp[i].nunidad = resp[0].parte_parametros == "E" ? resp[i].nunidade : resp[i].nunidadn;
          resp[i].punto_reorden = resp[0].parte_parametros == "E" ? resp[i].punto_reorden : resp[i].kanban_punto_reorden;
          if (+resp[i].area == -1)
          {
            resp[i].narea = this.cAreaSurtir;
          }
          else if (+resp[i].area == -2)
          {
            resp[i].narea = resp[i].nareap;
          }
        }
      }
      else if (tabla == 15 || tabla == 11)
      {
        this.cambiarVista(0);
      }
      
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        if (tabla == 1)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3883];
        }
        else if (tabla == 2)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3884];
        }
        else 
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3885];
        }
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (resp.length == 1 && tabla <= 1 && !this.desdeBoton)
      {
        this.arreTiempos.length = resp.length;
        this.arreDemas.length = resp.length;
        this.visualizarImagen = true;
        this.prevalidar(tabla + 1);
      }
      else
      {
        if (tabla != 2)
        {
          this.registros = resp; 
        }
        this.arrFiltrado = this.registros; 
        this.mostrarDetalle = true;  
        this.arreTiempos.length = resp.length;
        this.arreDemas.length = resp.length;
        this.arreHover.length = this.registros.length;
        this.visualizarImagen = true;
        setTimeout(() => {
          //this.visualizarImagen = true;
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
      this.desdeBoton = false;
      this.buscar();
      if (this.miSeleccion >= 11 && this.miSeleccion < 20 || this.miSeleccion == 200 || this.miSeleccion == 210)
      {
        this.revisarTiempo();
      } 
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
    this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[3905] + "]";
    this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
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
    if (this.servicio.rUsuario().preferencias_andon.substr(this.miSeleccion - 7, 1) == "1")
    {
      this.modelo = this.modelo >= 10 ? 2 : 12;
      this.ayuda11 = this.servicio.rTraduccion()[0]
      this.iconoVista = "i_vdetalle"
    }
    else
    {
      this.modelo = this.modelo >= 10 ? 3 : 13;  
      this.ayuda11 = this.servicio.rTraduccion()[1]
      this.iconoVista = "i_vcuadro"
    }
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
    this.tituloBuscar = this.servicio.rTraduccion()[3873];
    this.rRegistros(this.miSeleccion);
    this.leerBD();
  }

  
  regresar(id: number)
  {
    this.servicio.cierreSnack.emit(false);
    if (id == 0)
    {
      if (this.miSeleccion == 130)
      {
        this.rRegistros(100);
        return;

      }
      else if (this.miSeleccion == 210)
      {
        this.rRegistros(200);
        return;

      }
      if (this.editando && !this.cancelarEdicion)
      {
        return;
      }
      else
      {
        this.desdeBoton = true;
        this.miSeleccion = 13;
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
    if (this.miSeleccion <= 1)
    {
      this.laSeleccion[3] = 0;
      this.laSeleccion[7] = "[" + this.servicio.rTraduccion()[5] + "]";
      this.laSeleccion[11] = "";
      this.pAreaSurtir = +this.registros[id].kanban_area;
      if (this.registros[id].kanban_parametros == "C")
      {
        this.pTipo_surtido = this.cTipo_surtido;        
        this.pSobreStock = this.configuracion.kanban_permitir_sobre_stock;
      }
      else
      {
        this.pTipo_surtido = this.registros[id].kanban_tipo_surtido;
        this.pSobreStock = this.registros[id].kanban_permitir_sobre_stock;
      }
      this.eTipo_surtido = this.eTipo_surtido;
      this.prioridadP = !this.registros[id].kanban_prioridad ? 999999 : +this.registros[id].kanban_prioridad;
      this.prioridadP = this.prioridadP == 0 ? 999999 : this.prioridadP;
      
    }
    this.laSeleccion[this.miSeleccion - 1] = this.registros[id].id;
    this.laSeleccion[this.miSeleccion + 3] = this.registros[id].nombre;
    this.laSeleccion[this.miSeleccion + 7] = this.registros[id].url_mmcall;
    if (this.miSeleccion == 2)
    {
      this.cantidadPedir = this.registros[id].pedido;
      this.cantidadPedirT = this.registros[id].pedido +  " " + this.registros[id].nunidad;
      this.unidadTexto = this.registros[id].nunidad;
      this.cantidadPedirC = "";
      this.saldo = this.registros[id].saldo;
      this.tiempo_estimado = +this.registros[id].tiempo_estimado;
      this.prioridadN = !this.registros[id].kanban_prioridad ? 999999 : this.registros[id].kanban_prioridad;
      this.prioridadN = this.prioridadN == 0 ? 999999 : this.prioridadN;
      if (+this.registros[id].area == -2)
      {
        this.areaSurtir = this.pAreaSurtir;
      }
      else if (+this.registros[id].area == -1)
      {
        this.areaSurtir = this.configuracion.kanban_area;
      }
      else
      {
        this.areaSurtir = this.registros[id].area;                  
      }
      if (this.registros[id].kanban_parametros == "C")
      {
        this.eTipo_surtido = this.cTipo_surtido;
      }
      else if (this.registros[id].kanban_parametros == "P")
      {
        this.eTipo_surtido = this.pTipo_surtido;
      }
      else
      {
        this.eTipo_surtido = this.registros[id].tipo_surtido;
        this.pSobreStock = this.registros[id].permitir_sobre_stock;      
      }
      if (this.eTipo_surtido == "T")
      {
        this.tUso = +this.registros[id].enuso + 1;
        this.tLimite = this.registros[id].limite;
        this.tTexto = this.registros[id].pedidoTexto;
        this.cantidadPedirT = this.registros[id].pedidoTexto + " (" + this.servicio.rTraduccion()[3999] + ")";
      }
      if ((+this.registros[id].pedido == 0 || this.registros[id].pedido == this.servicio.rTraduccion()[3925]) && this.eTipo_surtido != "T")
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[3926], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
        });
        return;
      }
      if (+this.registros[id].enuso == this.registros[id].limite && this.eTipo_surtido == "T")
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[4005], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
        });
        return;
      }

      let cantidad = +this.registros[id].pedido + +this.registros[id].saldo + +this.registros[id].por_surtir;
      if (cantidad > +this.registros[id].stock_maximo && +this.registros[id].stock_maximo > 0 && this.pSobreStock=="N" && this.eTipo_surtido != "T")
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[3992] + "<br>" + this.servicio.rTraduccion()[3995] + ": <strong>" + (this.registros[id].saldo * 1) + " " + this.registros[id].nunidad + "</strong>" + "<br>" + this.servicio.rTraduccion()[3994] + ": <strong>" + (this.registros[id].stock_maximo * 1) + " " + this.registros[id].nunidad + "</strong>", alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
        });
        return;
      }
      this.cantidadPedirC = this.registros[id].parte_parametros + this.registros[id].kanban_par + this.registros[id].pedidoC;
    }

    if (this.miSeleccion < 2)
    {
      this.prevalidar(this.miSeleccion + 1);
    }
    else if (this.laSeleccion[0] != "" && this.laSeleccion[1] != "")//&& this.laSeleccion[2] != "" && this.laSeleccion[3] != "")
    {
      this.llamar(1);
    }
   }


   validarEntrada(cadenaScaner: string)
   {
     if (cadenaScaner.length == 0)
     {
       return;
     }
     let cadena = cadenaScaner.replace(/('|")/g, "");
     let lecturas =  cadena.split(",");
     if (this.miSeleccion == 210)
     {
      if (lecturas.length == 2)
      {
        //Se busca la operación (Kanban) 
        let sentencia = "SELECT a.kanban, a.secuencia, a.cantidad_solicitada, b.nombre AS nparte, c.nombre AS nproceso, f.nombre AS nunidad FROM " + this.servicio.rBD() + ".rkanban_det a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales f ON b.kanban_unidad = f.id WHERE a.kanban = " + +this.rutaCabecera + " AND c.referencia = '" + lecturas[0] + "' AND b.referencia = '" + lecturas[1] + "' AND a.estado < 10 ORDER BY a.secuencia ASC LIMIT 1";
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length > 0)
          {
            if (this.respetar_secuencia == "S" && +resp[0].secuencia != this.linea_siguiente)
            {
              const respuesta = this.dialogo.open(DialogoComponent, {
                width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4231], mensaje: this.servicio.rTraduccion()[4232].replace("campo_0", resp[0].secuencia).replace("campo_1", this.linea_siguiente), alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
                });
              return;
            }
            sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_det SET cantidad_confirmada = cantidad_solicitada, ejecutado = NOW(), ejecutado_por = " + this.servicio.rUsuario().id + ", estado = 10, turno_entrega = " + this.servicio.rTurno().id + " WHERE kanban = " + +resp[0].kanban + " AND secuencia = " +resp[0].secuencia + ";"
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( upd =>
            {
              sentencia = "SELECT a.secuencia, a.planeado FROM " + this.servicio.rBD() + ".rkanban_det a WHERE a.kanban = " + +this.rutaCabecera + " AND a.estado < 10 ORDER BY a.secuencia ASC LIMIT 1";
              campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp2 =>
              {
                if (resp2.length > 0)
                {
                  this.servicio.aEscanear(false);
                  sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET estado = 10, reprogramar = 'S', lineas_completadas = lineas_completadas + 1, linea_siguiente = " + resp2[0].secuencia + ", fecha_siguiente = '" + this.servicio.fecha(2, '' + new Date(resp2[0].planeado) , 'yyyy/MM/dd HH:mm:ss') + "' WHERE id = " + +resp[0].kanban
                  campos = {accion: 200, sentencia: sentencia};  
                  this.servicio.consultasBD(campos).subscribe( upd =>
                  {
                    this.linea_siguiente = +resp2[0].secuencia;
                    this.lineas_completadas  = this.lineas_completadas  + 1;
                    this.cadAvance = this.lineas_completadas + " " + this.servicio.rTraduccion()[3996] + " " + this.total_lineas + " (" + Math.round(+this.lineas_completadas / +this.total_lineas * 100) + "%)";
                    const respuesta = this.dialogo.open(DialogoComponent, {
                      width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4226], mensaje: this.servicio.rTraduccion()[4227].replace("campo_0", resp[0].secuencia).replace("campo_1", resp[0].nparte).replace("campo_2", resp[0].nproceso).replace("campo_3", resp[0].cantidad_solicitada * 1).replace("campo_4", resp[0].nunidad), alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
                      });
                  })
                }
                else
                {
                  sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET lineas_completadas = lineas_completadas + 1, estado = 50, fin = NOW() WHERE id = " + +resp[0].kanban
                  campos = {accion: 200, sentencia: sentencia};  
                  this.servicio.consultasBD(campos).subscribe( upd =>
                  {
                    const respuesta = this.dialogo.open(DialogoComponent, {
                      width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4229], mensaje: this.servicio.rTraduccion()[4230], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
                    });
                    this.regresar(0);
                  });
                }
                
              })
            })
          }
          else
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error"
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[4228];            
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          
        })
      }

      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal"
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[3953];              
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
     }
     else if (this.miSeleccion != 2 && this.miSeleccion != 15)
     {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3945], mensaje: this.servicio.rTraduccion()[3944], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
      });
      setTimeout(() => {
        this.servicio.aEscanear(true);
      }, 1000);
      return;
     }
     else
     {
      if (lecturas.length == 2)
      {
        let sentencia = "SELECT a.id, a.estado FROM " + this.servicio.rBD() + ".kanban_solicitudes a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id WHERE b.referencia = '" + lecturas[0] + "'" + (this.miSeleccion == 2 ? " AND a.proceso = " + this.laSeleccion[0] : "") + " AND a.cantidad_solicitada = " + +lecturas[1] + " AND a.estado <= 10 AND b.estatus = 'A' ORDER BY a.prioridad_operacion, a.prioridad_parte, a.fecha_sugerida";
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length == 0)
          {
            let sentencia = "SELECT nombre, kanban, estatus FROM " + this.servicio.rBD() + ".cat_partes WHERE referencia = '" + lecturas[0] + "'";
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal"
              let error = false;
              if (resp.length == 0)
              {   
                error = true;           
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3950];              
              }
              else if (resp.length == 1 && resp[0].estatus != "A")
              {              
                error = true;
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3951].replace("campo_0", resp[0].nombre);              
              }
              else if (resp.length == 1 && resp[0].kanban != "S")
              {              
                error = true
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3952].replace("campo_0", resp[0].nombre);              
              }
              else if (this.laSeleccion[0] == 0)
              {
                error = true;           
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3990];
              }
              
              else
              {              
                this.validarOpcion(390, lecturas[0], +lecturas[1], 0);
              }
              if (error)
              {
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })
          }
          else
          {
            if (+resp[0].estado == 0)
            {   
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-normal"
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[3972];
              mensajeCompleto.tiempo = 5000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {              
              //Se encuentra un pedido pendiente por surtir
            this.validarOpcion(392, lecturas[0], +lecturas[1], resp[0].id);
            }
            
          }
        })    
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal"
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[3953];              
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
     }

     
    setTimeout(() => {
      this.servicio.aEscanear(true);
    }, 3000);
  }

  crearSolicitud(parte: string, cantidad: number)
  {
    let sentencia = "SELECT a.parte AS id, a.por_surtir, b.nombre, b.referencia, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntipo, IFNULL(d.url_mmcall, '') AS nunidade, IFNULL(e.url_mmcall, '') AS nunidadn, 0 AS pedido, a.permitir_sobre_stock, a.parte_parametros, a.tiempo_estimado, a.punto_reorden, a.stock_maximo, a.lote_minimo, a.siguiente_lote, b.kanban_tiempo_estimado, b.kanban_punto_reorden, b.kanban_stock_maximo, b.kanban_lote_minimo, b.kanban_siguiente_lote, a.saldo, a.kanban_parametros, a.area, a.tipo_surtido, a.limite, a.enuso, b.imagen, b.kanban_prioridad, 'S' AS mostrarImagen FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id AND a.proceso = " + +this.laSeleccion[0] + " LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON b.tipo_componente = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales d ON a.unidad = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON b.kanban_unidad = e.id WHERE b.referencia = '" + parte + "' AND a.proceso = " + +this.laSeleccion[0];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        if (resp[0].kanban_parametros == "E")
        {
          this.eTipo_surtido = resp[0].tipo_surtido;
          resp[0].kanban_par = "E";
          this.pSobreStock = resp[0].permitir_sobre_stock;      
        }
        else if (resp[0].kanban_parametros == "P")
        {
          this.eTipo_surtido = this.pTipo_surtido;
          resp[0].kanban_par = "P";
        }
        else
        {
          this.eTipo_surtido = this.cTipo_surtido;
          resp[0].kanban_par = "C";
        }
        resp[0].nunidad = resp[0].parte_parametros == "E" ? resp[0].nunidade : resp[0].nunidadn;
        
        if (this.eTipo_surtido != "S")
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "500px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[3949].replace("campo_0", resp[0].nombre), id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inactivar" }
          });
          return;
        }
        if (cantidad + +resp[0].saldo + +resp[0].por_surtir > +resp[0].stock_maximo && +resp[0].stock_maximo > 0 && this.pSobreStock=="N")
        {
          let canPoner = (resp[0].stock_maximo - resp[0].saldo - resp[0].por_surtir) * 1;
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[3992] + "<br><br>" + this.servicio.rTraduccion()[3995] + ": <strong>" + (resp[0].saldo * 1) + " " + resp[0].nunidad + "</strong><br>" + this.servicio.rTraduccion()[4006] + ": <strong>" + (resp[0].por_surtir * 1) + " " + resp[0].nunidad + "</strong><br>" + this.servicio.rTraduccion()[3994] + ": <strong>" + (resp[0].stock_maximo * 1) + " " + resp[0].nunidad + "</strong><br>" + this.servicio.rTraduccion()[4008] + ": <strong>" + (canPoner < 0 ? 0 : canPoner ) + " " + resp[0].nunidad + "</strong>", alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        resp[0].tiempo_estimado = resp[0].parte_parametros == "E" ? +resp[0].tiempo_estimado : +resp[0].kanban_tiempo_estimado;
        resp[0].pedidoC = this.eTipo_surtido;
        resp[0].tipo_surtido = this.eTipo_surtido;
        this.laSeleccion[1] = +resp[0].id;
        this.cantidadPedir = cantidad;
        this.cantidadPedirT = cantidad +  " " + resp[0].nunidad;
        this.unidadTexto = resp[0].nunidad;
        this.cantidadPedirC = "";
        this.saldo = resp[0].saldo;
        this.tiempo_estimado = +resp[0].tiempo_estimado;
        this.prioridadN = !resp[0].kanban_prioridad ? 999999 : resp[0].kanban_prioridad;
        this.prioridadN = this.prioridadN == 0 ? 999999 : this.prioridadN;
        if (resp[0].kanban_parametros == "C")
        {
          this.eTipo_surtido = this.cTipo_surtido;
        }
        else if (resp[0].kanban_parametros == "P")
        {
          this.eTipo_surtido = this.pTipo_surtido;
        }
        else
        {
          this.eTipo_surtido = resp[0].tipo_surtido;                  
        }

        if (+resp[0].area == -2)
        {
          this.areaSurtir = this.pAreaSurtir;
        }
        else if (+resp[0].area == -1)
        {
          this.areaSurtir = this.configuracion.kanban_area;
        }
        else
        {
          this.areaSurtir = resp[0].area;                  
        }

        this.areaSurtir = +resp[0].area;
        resp[0].pedidoC = resp[0].pedidoC + (+resp[0].lote_minimo > 0 ? "S" : "N");
        resp[0].pedidoC = resp[0].pedidoC + (+resp[0].siguiente_lote > 0 ? "S" : "N");
        this.cantidadPedirC = resp[0].parte_parametros + resp[0].kanban_par + resp[0].pedidoC;

        this.llamar(1);
      }
    })
  }

  recibir(transaccion: number, cantidad: number, accion: number)
  {
    if (accion == 9)
    {
      this.validarOpcion(394, "", cantidad, transaccion);
      return; 
    }
    let sentencia = "SELECT a.id, a.tipo_surtido, a.tarjeta_texto, a.area, a.cantidad_solicitada, a.parte AS miparte, a.proceso, c.nombre, d.saldo, d.kanban_parametros, a.unidadtexto, d.confirmacion_tipo, b.kanban_confirmacion_tipo FROM " + this.servicio.rBD() + ".kanban_solicitudes a INNER JOIN " + this.servicio.rBD() + ".cat_procesos b ON a.proceso = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes c ON a.parte = c.id INNER JOIN " + this.servicio.rBD() + ".relacion_operaciones_partes d ON a.parte = d.parte AND a.proceso = d.proceso WHERE a.id = " + transaccion;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        let cantidadOriginal = +resp[0].cantidad_solicitada
        if (accion == 1)
        {
          this.servicio.aEscanear(false);
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass: 'dialogo_atencion', data: { titulo: (resp[0].tipo_surtido != "T" ? this.servicio.rTraduccion()[3976] : this.servicio.rTraduccion()[4002]), cantidadSugerida: cantidad, nUnidad: resp[0].unidadtexto, mensaje: (resp[0].tipo_surtido != "T" ? "" : this.servicio.rTraduccion()[4001]), kanban: (resp[0].tipo_surtido != "T" ? 2 : 3), botones: 2, boton1STR: (resp[0].tipo_surtido != "T" ? this.servicio.rTraduccion()[3939] : this.servicio.rTraduccion()[4003]), icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
          });
          respuesta.afterClosed().subscribe(result => {
            this.servicio.aEscanear(true);
            if (!result)
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            if (result.accion == 1) 
            {
              if (result.nuevaCantidad <= 0 && resp[0].tipo_surtido != "T")
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "snack-error";
                mensajeCompleto.mensaje = this.servicio.rTraduccion()[3980];
                mensajeCompleto.tiempo = 2000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
              else
              {
                if (resp[0].tipo_surtido == "T")
                {
                  result.nuevaCantidad = 1;
                }
                let confirmacion = resp[0].confirmacion_tipo;
                if (resp[0].kanban_parametros == "P")
                {
                  confirmacion = resp[0].kanban_confirmacion_tipo;
                }
                else if (resp[0].kanban_parametros == "C")
                {
                  confirmacion = this.configuracion.kanban_confirmacion_tipo;
                }
                if (confirmacion == "S")
                {
                  this.recibir(transaccion, result.nuevaCantidad, 9);
                }
                else
                {
                  this.recibir(transaccion, result.nuevaCantidad, 2);
                }
                
              }
            }
            else if (result.accion == 2) 
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
          })
          return;
      }
        
        let sentencia = "UPDATE " + this.servicio.rBD() + ".kanban_solicitudes SET fecha_entrega = NOW(), estado = 40, surtidor = " + this.servicio.rUsuario().id + ", confirmador = " + this.confirmador + ", turno_entrega = " + this.servicio.rTurno().id + ", cantidad_confirmada = " + cantidad + ", saldo_ubicacion_antes = " + +resp[0].saldo + " WHERE id = " + +resp[0].id;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( upd =>
        {

          sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_movimientos (fecha, clase, tipo, saldo_ubicacion_antes, parte, proceso, cantidad, usuario, transaccion, referencia, unidad, tarjeta_texto, tipo_surtido, area, turno) VALUES(NOW(), 1, 'R', " + +resp[0].saldo + ", " + +resp[0].miparte + ", " + +resp[0].proceso + ", " + cantidad + ", " + this.servicio.rUsuario().id + ", " + +resp[0].id + ", '" + this.servicio.rTraduccion()[3975] + "-" + resp[0].id + "', '" + resp[0].unidadtexto + "', '" + resp[0].tarjeta_texto + "', '" + resp[0].tipo_surtido + "', " + +resp[0].area + ", " + this.servicio.rTurno().id + ");UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET por_surtir = por_surtir - " + cantidadOriginal + (resp[0].tipo_surtido == "T" ? ", enuso = enuso - 1" : ", saldo = saldo + " + cantidad) + " WHERE proceso = " + +resp[0].proceso + " AND parte = " + +resp[0].miparte
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( upd =>
          {
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3974], mensaje: this.servicio.rTraduccion()[3973].replace("campo_0", resp[0].nombre).replace("campo_1", (cantidad * 1 + resp[0].unidadtexto)), alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
            })
            this.totales();
          });
        
        })
      }
    })
  }


  validarOpcion(opcion: number, parte: string, cantidad: number, transaccion: number) 
  {
    if (this.servicio.rUsuario().id == 0)
    {
      this.sesion(opcion, parte, cantidad, transaccion);
      return;
    }
    let sentencia = "SELECT * FROM " + this.servicio.rBD() + ".relacion_usuarios_opciones WHERE usuario = " + this.servicio.rUsuario().id + " AND opcion = " + opcion;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0 || this.servicio.rUsuario().rol == "A")
      {
        if (opcion == 390)
        {
          this.crearSolicitud(parte, cantidad);
        }
        if (opcion == 397 && transaccion > 0)
        {
          this.cancelarPunto(transaccion, 1);
        }
        else if (opcion == 397)
        {
          this.cancelarRuta(2);
        }
        else if (opcion == 392)
        {
          this.recibir(transaccion, cantidad, 1);
        }
        else if (opcion == 394)
        {
          this.recibir(transaccion, cantidad, 2);
        }
        else if (opcion == 11)
        {
          this.rRegistros(11);
          this.vistaOperador = false;
          this.enTecnico = true;
        }
      }
      else
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal"
        if (opcion == 390)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3948];        
        }
        else if (opcion == 397 && transaccion > 0)
        {
          this.sesion(opcion, parte, cantidad, transaccion);
        }
        else if (opcion == 397)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[4219];        
        }
        else if (opcion == 392)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3971];        
        }
        else if (opcion == 394)
        {
          this.sesion(opcion, parte, cantidad, transaccion);
        }
        else if (opcion == 11)
        {
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3981];        
        }
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  seguirFiltrando()
  {
    this.sondeo = 0;
    this.noLeer = true;
    this.animando = false;
    this.textoBuscado = this.textoBuscar;
    this.registros = this.aplicarFiltro(this.textoBuscado);
    this.textoBuscar = "";
    setTimeout(() => {
      this.animando = true;  
    }, 200);
    
    this.contarRegs(); 
    this.noLeer = false;   
  }    

  
  filtrar()
  {
    this.seguirFiltrando()
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
    if (this.router.url.substr(0, 7) != "/kanban")
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
    if (this.miSeleccion==11 || this.miSeleccion==15)
    {
      this.alarmados = 0;
      for (var i = 0; i < this.registros.length; i++)
      {
        if ((this.registros[i].alarmado == 'S' && this.miSeleccion==11))
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
    if (this.configuracion.kanban_permitir_multiples_reportes!='N')
    {
      this.llamar(9);
      return;
    }
    let sentencia = "SELECT a.id, a.fecha_solicitud, cantidad_solicitada, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS nsolicitante FROM " + this.servicio.rBD() + ".kanban_solicitudes a LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios b ON a.solicitante = b.id WHERE a.proceso = " + this.laSeleccion[0] + " AND a.parte = " + this.laSeleccion[1] + " AND a.estado <= 10 ";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp. length == 0)
      {
        this.llamar(9);
      }
      else
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3965], mensaje: this.servicio.rTraduccion()[3966] + resp[0].id + this.servicio.rTraduccion()[3967] + resp[0].nsolicitante + this.servicio.rTraduccion()[3968] + resp[0].cantidad_solicitada * 1 + this.servicio.rTraduccion()[3969] + resp[0].fecha_solicitud + this.servicio.rTraduccion()[3970], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
        });
      }
    })
  }

  llamar(id: number)
  {
    if (id == 9)
    {
      this.mmcallAreaSurtir = "";
      let sentencia = "SELECT a.url_mmcall_kanban FROM " + this.servicio.rBD() + ".cat_areas a WHERE a.id = " + this.areaSurtir;
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.mmcallAreaSurtir = !resp[0].url_mmcall_kanban ? "" : resp[0].url_mmcall_kanban ;
          this.llamar(2);
        }
      })
    }
    else if (id==1)
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
      this.maquinaSel = false;
      this.lineaSel = false;
      this.envioCancelado = false;
      if (this.laSeleccion[0] == 0 ||  this.laSeleccion[1] == 0)
      {
        let faltante = "";
        faltante = faltante + (this.laSeleccion[0] == 0 ? this.servicio.rTraduccion()[3916] : "");
        faltante = faltante + (this.laSeleccion[1] == 0 ? this.servicio.rTraduccion()[3917] : "");

        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[3946], mensaje: this.servicio.rTraduccion()[3947] + faltante, alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
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
        }) 
        
      }
      else
      {
        this.miSeleccion = 2;
        if (this.configuracion.kanban_confirmar_mensaje_mantto=="S") //revisar Elvis
        {
          let urlFinal = this.configuracion.url_mmcall;
          if (this.configuracion.accion_mmcall == "S")
          {
            urlFinal = urlFinal + this.mmcallAreaSurtir
          }
          else
          {
            urlFinal = this.mmcallAreaSurtir
          }
          
          if (this.configuracion.ip_localhost)
          {
            urlFinal = urlFinal.replace(/localhost:8081/gi, this.configuracion.ip_localhost);
          }
          let faltante = "";
          faltante = faltante + this.servicio.rTraduccion()[3916] + this.laSeleccion[4] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[3917] + this.laSeleccion[5] + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[3929] + this.cantidadPedirT + "</strong>";
          faltante = faltante + this.servicio.rTraduccion()[88] + (this.configuracion.accion_mmcall == "S" ? this.servicio.rTraduccion()[89] : this.servicio.rTraduccion()[90]) + "</strong>";
          if (!this.movil)
          {
            faltante = faltante + this.servicio.rTraduccion()[91] + urlFinal;
          }
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "500px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3920], mensaje: this.servicio.rTraduccion()[3921] + faltante, id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
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
        this.cAreaSurtir = "";
        let sentencia = "SELECT nombre FROM " + this.servicio.rBD() + ".cat_areas WHERE id = " + +resp[0].kanban_area;
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( configuracion =>
        {
          this.cAreaSurtir = configuracion[0].nombre;
        });
        resp[0].version = 1;
        this.configuracion = resp[0];         
        this.cTipo_surtido = this.configuracion.kanban_tipo_surtido;
        if (!this.configuracion.tiempo_reporte)
        {
          this.configuracion.tiempo_reporte = 3600;

        }
        else if (+this.configuracion.tiempo_reporte <= 0)
        {
          this.configuracion.tiempo_reporte = 3600;
        } 
        
        
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
      urlFinal = urlFinal + this.mmcallAreaSurtir
    }
    else
    {
      urlFinal = this.mmcallAreaSurtir
    }
    if (this.configuracion.ip_localhost)
    {
      urlFinal = urlFinal.replace(/localhost:8081/gi, this.configuracion.ip_localhost);
    }
    
    let str = "KANBAN " + this.laSeleccion[4] + " / " + this.laSeleccion[5];
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

    //Se buscan los parámetros para el surtido
    if (this.secuencia == 0)
    {
      let sentencia = "SELECT turno_secuencia FROM " + this.servicio.rBD() + ".configuracion";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.secuencia = resp[0].turno_secuencia;
        this.grabar();
      })
      return;
    }

    //Se buscan los parámetros para el surtido
    if (this.areaSurtir == 0)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3923], mensaje: this.servicio.rTraduccion()[3922], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
      });
      return;
    } 
    //
    
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
    let sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_solicitudes (proceso, parte, area, solicitante, turno, fecha_reporte, fecha_solicitud, fecha_sugerida, secuencia, cantidad_solicitada, tipo_cantidad, saldo_ubicacion_antes, lead_time, prioridad_operacion, prioridad_parte, unidadtexto, tipo_surtido, tarjeta_uso, tarjeta_limite, tarjeta_texto) VALUES(" + this.laSeleccion[0] + ", " + this.laSeleccion[1] + ", "  + this.areaSurtir + ", "  + this.servicio.rUsuario().id + ", " + this.servicio.rTurno().id + ", '" + estaFecha + "', NOW(), NOW(), " + +this.secuencia + ", " + this.cantidadPedir + ", '" + this.cantidadPedirC + "', " + +this.saldo + ", " + +this.tiempo_estimado + ", " + +this.prioridadP + ", " + +this.prioridadN + ", '" + this.unidadTexto + "', '" + this.eTipo_surtido + "', " + +this.tUso + ", " + +this.tLimite + ", '" + this.tTexto + "');UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET por_surtir = por_surtir + " + this.cantidadPedir + " " + (this.eTipo_surtido == "T" ? ", enuso = enuso + 1" : "") + " WHERE proceso = " + +this.laSeleccion[0] + " AND parte = " + +this.laSeleccion[1]
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {

      sentencia = "SELECT id, fecha_solicitud FROM " + this.servicio.rBD() + ".kanban_solicitudes ORDER BY id DESC LIMIT 1";
      campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (this.configuracion.mostrar_numero=="S")
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3933], mensaje: this.servicio.rTraduccion()[3934] + "<strong>" + +resp[0].id + "</strong>", alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
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
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[3934] + " " + resp[0].id
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        if (this.configuracion.kanban_ver_reportes_final=="S")
        {
          this.servicio.mensajeInferior.emit("");
          this.laSeleccion[0] = 0;
          this.laSeleccion[1] = 0;
          this.laSeleccion[2] = 0;
          this.laSeleccion[3] = 0;
          this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[3905] + "]";
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
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
//        this.servicio.guardarVista(this.miSeleccion, (vistaRecuadro ? 1: 0))
//      }
//      else
//      {
//        this.servicio.guardarVista(this.miSeleccion - 6, (vistaRecuadro ? 1: 0))
//      }
//    }
//    else if (this.vistaOperador)
//    {
//      vistaRecuadro = this.servicio.rUsuario().preferencias_andon.substr(this.miSeleccion - 1, 1) == "1";
    }
    else
    {
      vistaRecuadro = this.servicio.rUsuario().preferencias_andon.substr(this.indicePreferencia - 1, 1) == "1";
      //vistaRecuadro = this.servicio.rUsuario().preferencias_andon.substr(this.miSeleccion - 7, 1) == "1";
    }
    if (vistaRecuadro)
    {
      if (!this.iniciado)
      {
        this.modelo = 2;          
      }
      else 
      {
        this.modelo = this.modelo == 13 ? 12 : this.modelo == 3 ? 2 : this.modelo;
      }

      this.iniciado = true;
      this.ayuda11 = this.servicio.rTraduccion()[0]
      this.iconoVista = "i_vdetalle"
      this.verTabla = false;
      
    }
    else
    {
      if (!this.iniciado)
      {
        this.modelo = 3;
      }
      else 
      {
        this.modelo = this.modelo == 12 ? 13 : this.modelo == 2 ? 3 : this.modelo;
      }

      this.iniciado = true;
      //this.modelo = this.modelo >= 10 ? 3 : 13;
      this.ayuda11 = this.servicio.rTraduccion()[1]
      this.iconoVista = "i_vcuadro"
      this.verTabla = true;
      this.calcularElementos();
    }
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
    else if (this.miSeleccion >= 11 && this.miSeleccion < 20 || this.miSeleccion == 200 || this.miSeleccion == 210)
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
        if (this.miSeleccion < 200)
        {
          if (this.registros[i].estado <= 10 && this.registros[i].lead_time > 0) 
          {
            let tmpHora;
            tmpHora = new Date(this.registros[i].fecha_sugerida);
      
            let segundos =  this.servicio.tiempoTranscurrido(tmpHora, "FS").split(";")[3];
            if (+segundos > 0)
            {
              let cadSegundos =  this.servicio.tiempoTranscurrido(tmpHora, "F").split(";");
              this.arreTiempos[i] = cadSegundos[1] + ":" + (+cadSegundos[2] < 10 ? "0" + cadSegundos[2] : cadSegundos[2]) + ":" + (+cadSegundos[3] < 10 ? "0" + cadSegundos[3] : cadSegundos[3]);
            }
            else
            {
              let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].fecha_sugerida, "").split(";");
              this.arreDemas[i]  = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
              this.arreTiempos[i] = "00:00:00";
            }
          }
          else
          {
            let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].fechac, "").split(";");
            this.registros[i].transcurrido = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            this.arreTiempos[i] = this.registros[i].transcurrido
          }
          this.contarTiempo = true;
        }
        if (this.miSeleccion == 200)
        {
          if (this.registros[i].estado == 0) 
          {
            this.arreTiempos[i] = this.servicio.rTraduccion()[449];
          }
          else if (this.registros[i].estado < 50) 
          {
            let tmpHora;
            tmpHora = new Date(this.registros[i].fecha_siguiente);
      
            let segundos =  this.servicio.tiempoTranscurrido(tmpHora, "FS").split(";")[3];
            if (+segundos > 0)
            {
              let cadSegundos =  this.servicio.tiempoTranscurrido(tmpHora, "F").split(";");
              if (+cadSegundos[1] > 24)
              {
                let dias = Math.floor(+cadSegundos[1] / 24);
                this.arreTiempos[i] = ">" + dias + " " + this.servicio.rTraduccion()[4291];
              }
              else
              {
                this.arreTiempos[i] = cadSegundos[1] + ":" + (+cadSegundos[2] < 10 ? "0" + cadSegundos[2] : cadSegundos[2]) + ":" + (+cadSegundos[3] < 10 ? "0" + cadSegundos[3] : cadSegundos[3]);
              }
            }
            else
            {
              let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].fecha_siguiente, "").split(";");
              this.arreDemas[i]  = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
              this.arreTiempos[i] = "00:00:00";
            }
            
          }
          this.contarTiempo = true;
        }
        else if (this.miSeleccion == 210)
        {
          if (this.registros[i].estado < 10) 
          {
            let tmpHora;
            tmpHora = new Date(this.registros[i].planeado);
      
            let segundos =  this.servicio.tiempoTranscurrido(tmpHora, "FS").split(";")[3];
            if (+segundos > 0)
            {
              let cadSegundos =  this.servicio.tiempoTranscurrido(tmpHora, "F").split(";");
              if (+cadSegundos[1] > 24)
              {
                let dias = Math.floor(+cadSegundos[1] / 24);
                this.arreTiempos[i] = ">" + dias + " " + this.servicio.rTraduccion()[4291];
              }
              else
              {
                this.arreTiempos[i] = cadSegundos[1] + ":" + (+cadSegundos[2] < 10 ? "0" + cadSegundos[2] : cadSegundos[2]) + ":" + (+cadSegundos[3] < 10 ? "0" + cadSegundos[3] : cadSegundos[3]);
              }
              
            }
            else
            {
              let segundos =  this.servicio.tiempoTranscurrido(this.registros[i].planeado, "").split(";");
              this.arreDemas[i]  = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
              this.arreTiempos[i] = "00:00:00";
            }
            
          }
          this.contarTiempo = true;
        }
      }
    }

  leerBD()
  {
    if (this.configuracion.kanban_ver_reportes_final=='S')
    {
      this.totales();
    }
    if (this.noLeer || this.router.url.substr(0, 7) != "/kanban"  || (!this.enTecnico && this.miSeleccion != 15 && this.miSeleccion!=200 && this.miSeleccion!=210 ))
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
              for (var j = arreTemp.length - 1; j >= 0 ; j--)
              {
                if (this.miSeleccion == 200)
                {
                  if (this.registros[i].id ==  arreTemp[j].id)
                  {
                    if (this.registros[i].alarmado !=  arreTemp[j].alarmado)
                    {
                      this.registros[i].alarmado = arreTemp[j].alarmado;
                    }
                    if (this.registros[i].estado !=  arreTemp[j].estado)
                    {
                      this.registros[i].estado = arreTemp[j].estado;
                    }
                    if (this.registros[i].estatus !=  arreTemp[j].estatus)
                    {
                      this.registros[i].estatus = arreTemp[j].estatus;
                    }
                    if (this.registros[i].linea_siguiente !=  arreTemp[j].linea_siguiente)
                    {
                      this.registros[i].linea_siguiente = arreTemp[j].linea_siguiente;
                    }
                    if (this.registros[i].estado !=  arreTemp[j].estado)
                    {
                      this.registros[i].estado = arreTemp[j].estado;
                    }
                    hallado = true;
                    break;
                  }
                }
                else if (this.miSeleccion == 210)
                {
                  if (this.registros[i].secuencia ==  arreTemp[j].secuencia)
                  {
                    if (this.registros[i].alarmado !=  arreTemp[j].alarmado)
                    {
                      this.registros[i].alarmado = arreTemp[j].alarmado;
                    }
                    if (this.registros[i].planeado !=  arreTemp[j].planeado)
                    {
                      this.registros[i].planeado = arreTemp[j].planeado;
                    }
                    if (this.registros[i].estado !=  arreTemp[j].estado)
                    {
                      this.registros[i].estado = arreTemp[j].estado;
                      this.registros[i].nestado = arreTemp[j].nestado;
                      this.registros[i].ttiempo = arreTemp[j].ttiempo;
                    }
                    hallado = true;
                    break;
                  }
                }
                else
                {
                  if (this.registros[i].id ==  arreTemp[j].id && this.registros[i].estado ==  arreTemp[j].estado)
                  {
                    if (this.registros[i].alarmado !=  arreTemp[j].alarmado)
                    {
                      this.registros[i].alarmado = arreTemp[j].alarmado;
                    }
                    hallado = true;
                    break;
                  }
                }
                
              }
            if (!hallado)
            {
              this.registros.splice(i, 1);
              this.arreHover.length = resp.length;
              this.arreTiempos.length = resp.length;
              this.arreDemas.length = resp.length;
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
              this.arreHover.length = resp.length;
              this.arreTiempos.length = resp.length;
              this.arreDemas.length = resp.length;
              this.sondeo = arreTemp[i].id;
      
            }
          }
          
        }
        this.contarRegs()
      }
      clearTimeout(this.leeBD);
      if (this.router.url.substr(0, 7) == "/kanban")
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
      if (this.registros[id].estado <= 10)
      {
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[3989]
      }
      mensajeCompleto.tiempo = 3000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      return;
    }
    this.servicio.cierreSnack.emit(false);
    this.reporteSeleccionado = this.registros[id].id;
    this.maquinaSeleccionado = this.registros[id].confirmar_reparacion;
    this.maquinaSeleccionado = !this.maquinaSeleccionado ? "N" : this.maquinaSeleccionado;
    if (+this.registros[id].estado <= 10)
    {
      //this.reparar(id);
      this.validarOpcion(392, "", this.registros[id].cantidad_solicitada, this.registros[id].id);
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

  
  totales()
  {
    let filtroLinea = ""
    if (this.servicio.rUsuario().operacion!="S")
    {
      filtroLinea = " proceso IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 1 AND usuario = " + this.servicio.rUsuario().id + ") ";
    } 
    let filtroArea = ""
    if (this.servicio.rUsuario().area!="S")
    {
      filtroArea = (filtroLinea ? " AND " : "") +  " area IN (SELECT proceso FROM " + this.servicio.rBD() + ".relacion_usuarios_operaciones WHERE tipo = 3 AND usuario = " + this.servicio.rUsuario().id + ") ";
    }
    let cadFiltro = "";
    if (filtroLinea || filtroArea)
    {
      cadFiltro = " WHERE " + filtroLinea + filtroArea;
    }
    let sentencia = "SELECT SUM(CASE WHEN estado <= 10 THEN 1 ELSE 0 END) AS kp, SUM(CASE WHEN estado >= 40 THEN 1 ELSE 0 END) AS kc, SUM(CASE WHEN alarmado = 'S' AND estado <= 10 THEN 1 ELSE 0 END) AS kpa FROM " + this.servicio.rBD() + ".kanban_solicitudes " + cadFiltro;
    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
      resp[0].kp = !resp[0].kp ? 0 : resp[0].kp;
      resp[0].kp = +resp[0].kp > 99 ? "+99" : resp[0].kp;
      resp[0].kpa = !resp[0].kpa ? 0 : resp[0].kpa;
      this.rsaAlarmado = +resp[0].kpa > 0 ? 2 : 0;
      this.total.kp = resp[0].kp;
      this.total.kpa = resp[0].kpa;
      }
      else
      {
        this.total.kp = 0;
        this.total.kpa = 0;
      }
      
    })
  }

  prevalidar(vez: number)
  {
    //this.registros = [];
    let sentencia = "SELECT a.id, a.nombre, a.imagen, 'S' AS mostrarImagen, a.kanban_area, a.kanban_tipo_surtido, a.kanban_parametros, a.kanban_prioridad FROM " + this.servicio.rBD() + ".cat_procesos a INNER JOIN " + this.servicio.rBD() + ".relacion_usuarios_operaciones b ON a.id = b.proceso AND b.tipo = 0 AND b.usuario = " + this.servicio.rUsuario().id + " WHERE a.estatus = 'A' AND a.kanban = 'S' AND a.kanban_manual = 'S' ORDER BY a.nombre;"
    if (this.servicio.rUsuario().operacion=="S")
    {
      sentencia = "SELECT a.id, a.nombre, a.imagen, 'S' AS mostrarImagen, a.kanban_area, a.kanban_tipo_surtido, a.kanban_parametros FROM " + this.servicio.rBD() + ".cat_procesos a WHERE a.estatus = 'A' AND a.kanban = 'S' AND a.kanban_manual = 'S' ORDER BY a.nombre;"
    }
    
    if (vez == 2)
    {
      
      sentencia = "SELECT a.parte AS id, b.nombre, b.imagen, a.kanban_parametros, a.area, a.tipo_surtido, IFNULL(c.nombre, '" + this.servicio.rTraduccion()[8] + "') AS ntipo, 'S' AS mostrarImagen, IFNULL(d.url_mmcall, '') AS nunidade, IFNULL(e.url_mmcall, '') AS nunidadn, a.parte_parametros, a.tiempo_estimado, a.punto_reorden, a.stock_maximo, a.lote_minimo, a.siguiente_lote, b.kanban_tiempo_estimado, b.kanban_punto_reorden, b.kanban_stock_maximo, b.kanban_lote_minimo, b.kanban_siguiente_lote, b.kanban_prioridad FROM " + this.servicio.rBD() + ".relacion_operaciones_partes a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id AND b.estatus = 'A' LEFT JOIN " + this.servicio.rBD() + ".cat_generales c ON b.tipo_componente = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales d ON a.unidad = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales e ON b.kanban_unidad = e.id WHERE a.proceso = " + +this.laSeleccion[0] + " AND (b.kanban_manual = 'S' AND a.parte_parametros = 'P') OR (a.manual = 'S' AND a.parte_parametros = 'E') ORDER BY b.nombre;"
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
          this.laSeleccion[4] = "[" + this.servicio.rTraduccion()[3905] + "]";
          this.laSeleccion[8] = "";
          
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
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
            
          this.rRegistros(1);
          
        }
        else if (resp.length == 1 )
        {
          
          this.laSeleccion[0] = resp[0].id;
          this.laSeleccion[4] = resp[0].nombre;
          this.laSeleccion[8] = resp[0].url_mmcall;
          this.areaSurtir = +this.configuracion.kanban_area;
          
          if (resp[0].kanban_parametros == "C")
          {
            this.pTipo_surtido = this.cTipo_surtido;
          }
          else
          {
            this.pTipo_surtido = resp[0].kanban_tipo_surtido;
            this.areaSurtir = resp[0].kanban_area;
            this.prioridadP = !resp[0].kanban_prioridad ? 999999 : +resp[0].kanban_prioridad;
            this.prioridadP = this.prioridadP == 0 ? 999999 : this.prioridadP;
          }
          this.boton02 = true;
          setTimeout(() => {
            this.prevalidar(2);  
          }, 100);
        }
        
        
      }
      else if (vez == 2)
      {
        this.boton02 = true;
        
        if (resp.length > 1 || resp.length == 0 )
        {
          
          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
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
          this.rRegistros(2);
          
        }
        else if (resp.length == 1 )
        {

          this.laSeleccion[1] = 0;
          this.laSeleccion[5] = "[" + this.servicio.rTraduccion()[3906] + "]";
          this.laSeleccion[9] = "";
          
          this.boton03 = true;
          this.boton04 = true;



          if (resp[0].kanban_parametros == "E")
          {
            this.eTipo_surtido = resp[0].tipo_surtido;
            this.areaSurtir = +resp[0].area;
          }
          else if (resp[0].kanban_parametros == "P")
          {
            this.eTipo_surtido = this.pTipo_surtido;
          }
          else
          {
            this.eTipo_surtido = this.cTipo_surtido;
          }
          
          setTimeout(() => {
            this.rRegistros(2);
          }, 100);
        }
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

  editarCantidad(id: number)
  {
    this.servicio.aEscanear(false);
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[3937], cantidadSugerida: this.registros[id].pedido, nUnidad: this.registros[id].nunidad, mensaje: "", kanban: 1, botones: 2, boton1STR:this.servicio.rTraduccion()[3939], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
    });
    respuesta.afterClosed().subscribe(result => {
      this.servicio.aEscanear(true);
      if (!result)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (result.accion == 1) 
      {
        if (result.nuevaCantidad < 0)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3993], mensaje: this.servicio.rTraduccion()[4000], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        let cantidad = (result.nuevaCantidad < 0 ? 0 : result.nuevaCantidad) + +this.registros[id].saldo + +this.registros[id].por_surtir;
        if (cantidad > +this.registros[id].stock_maximo && +this.registros[id].stock_maximo > 0 && this.pSobreStock=="N")
        {
          let canPoner = (this.registros[id].stock_maximo - this.registros[id].saldo - this.registros[id].por_surtir) * 1;
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[3993], mensaje: this.servicio.rTraduccion()[3992] + "<br><br>" + this.servicio.rTraduccion()[3995] + ": <strong>" + (this.registros[id].saldo * 1) + " " + this.registros[id].nunidad + "</strong><br>" + this.servicio.rTraduccion()[4006] + ": <strong>" + (this.registros[id].por_surtir * 1) + " " + this.registros[id].nunidad + "</strong><br>" + this.servicio.rTraduccion()[3994] + ": <strong>" + (this.registros[id].stock_maximo * 1) + " " + this.registros[id].nunidad + "</strong><br>" + this.servicio.rTraduccion()[4008] + ": <strong>" + (canPoner < 0 ? 0 : canPoner) + " " + this.registros[id].nunidad + "</strong>", alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        this.registros[id].pedido = result.nuevaCantidad < 0 ? 0 : result.nuevaCantidad;
        this.registros[id].ccambiada = 1;
        this.registros[id].pedidoTexto = this.registros[id].pedido != this.servicio.rTraduccion()[3925] ? (this.registros[id].pedido * 1 + ' ' + this.registros[id].nunidad) : this.registros[id].pedido;   

        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-normal";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[3942];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      else if (result.accion == 2) 
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  regAjuste(id: number)
  {
    this.servicio.aEscanear(false);
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "460px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4060], cantidadSugerida: this.registros[id].saldo, nUnidad: this.registros[id].nunidad, mensaje: this.servicio.rTraduccion()[4062], kanban: 10, botones: 2, boton1STR:this.servicio.rTraduccion()[4064], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inventario" }
    });
    respuesta.afterClosed().subscribe(result => {
      this.servicio.aEscanear(true);
      if (!result)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (result.accion == 1) 
      {
        if (result.nuevaCantidad < 0)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4080], mensaje: this.servicio.rTraduccion()[4000], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        if (result.nuevaCantidad == +this.registros[id].saldo)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4080], mensaje: this.servicio.rTraduccion()[4063], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        let sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_movimientos (fecha, clase, tipo, saldo_ubicacion_antes, parte, proceso, cantidad, usuario, transaccion, referencia, unidad, causa, notas, turno) VALUES(NOW(), 1, 'A', " + +this.registros[id].saldo  + ", " + +this.registros[id].parte + ", " + +this.registros[id].proceso + ", " + (result.nuevaCantidad - +this.registros[id].saldo) + ", " + this.servicio.rUsuario().id + ", 0, '" + this.servicio.rTraduccion()[4046] + "', '" + this.registros[id].nunidad + "', " + +result.causa + ", '" + result.notas + "', " + this.servicio.rTurno().id + ");UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET saldo = " + +result.nuevaCantidad + " WHERE id = " + +this.registros[id].id;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( upd =>
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4065], mensaje: this.servicio.rTraduccion()[4066], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inventario" }
          })
          this.registros[id].saldo = result.nuevaCantidad;
        });
      }
      else if (result.accion == 2) 
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

  regConsumo(id: number)
  {
    this.servicio.aEscanear(false);
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "460px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4069], cantidadSugerida: this.registros[id].saldo, nUnidad: this.registros[id].nunidad, mensaje: this.servicio.rTraduccion()[4071], kanban: 11, botones: 2, boton1STR:this.servicio.rTraduccion()[4072], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inicializar" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (!result)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      if (result.accion == 1) 
      {
        if (result.nuevaCantidad == 0)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4073], mensaje: this.servicio.rTraduccion()[4000], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        if (result.nuevaCantidad < 0)
        {
          this.cantidadNegativa = result.nuevaCantidad;
          this.notasNegativa = result.notas;
          this.ordenNegativa = +result.orden;
          this.causaNegativa = +result.causa;
          this.servicio.aEscanear(false);
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "460px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4082], mensaje: this.servicio.rTraduccion()[4083], id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR:this.servicio.rTraduccion()[4072], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inicializar" }
          });
          respuesta.afterClosed().subscribe(result => {
            if (!result)
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              return;
            }
            if (result.accion == 1) 
            {
              let sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_movimientos (fecha, clase, tipo, saldo_ubicacion_antes, parte, proceso, cantidad, usuario, transaccion, referencia, unidad, causa, notas, turno) VALUES(NOW(), 1, 'C', " + +this.registros[id].saldo  + ", " + +this.registros[id].parte + ", " + +this.registros[id].proceso + ", " + this.cantidadNegativa * -1 + ", " + this.servicio.rUsuario().id + ", " + this.ordenNegativa + ", '" + this.servicio.rTraduccion()[4047] + "-" + this.ordenNegativa + "', '" + this.registros[id].nunidad + "', " + this.causaNegativa + ", '" + this.notasNegativa + "', " + this.servicio.rTurno().id + ");UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET saldo = " + (+this.registros[id].saldo + this.cantidadNegativa * -1) + " WHERE id = " + +this.registros[id].id;
              let campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( upd =>
              {
                const respuesta = this.dialogo.open(DialogoComponent, {
                  width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4069], mensaje: this.servicio.rTraduccion()[4081], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inicializar" }
                })
                this.registros[id].saldo = +this.registros[id].saldo + this.cantidadNegativa *-1;
              });
            }
            else if (result.accion == 2) 
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "snack-error";
              mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
          })
          return;
        }
        else if (+result.nuevaCantidad > +this.registros[id].saldo)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4073], mensaje: this.servicio.rTraduccion()[4074], alto: "40", id: 0, tiempo: 5, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          return;
        }
        let sentencia = "INSERT INTO " + this.servicio.rBD() + ".kanban_movimientos (fecha, clase, tipo, saldo_ubicacion_antes, parte, proceso, cantidad, usuario, transaccion, referencia, unidad, causa, notas, turno) VALUES(NOW(), 1, 'C', " + +this.registros[id].saldo  + ", " + +this.registros[id].parte + ", " + +this.registros[id].proceso + ", " +result.nuevaCantidad * -1 + ", " + this.servicio.rUsuario().id + ", " + +result.orden + ", '" + this.servicio.rTraduccion()[4047] + "-" + +result.orden + "', '" + this.registros[id].nunidad + "', " + +result.causa + ", '" + result.notas + "', " + this.servicio.rTurno().id + ");UPDATE " + this.servicio.rBD() + ".relacion_operaciones_partes SET saldo = " + (+this.registros[id].saldo - +result.nuevaCantidad) + " WHERE id = " + +this.registros[id].id;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( upd =>
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4069], mensaje: this.servicio.rTraduccion()[4081], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_inicializar" }
          })
          this.registros[id].saldo = this.registros[id].saldo - +result.nuevaCantidad;
        });
      }
      else if (result.accion == 2) 
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
  }

 sesion(opcion: number, parte: string, cantidad: number, transaccion: number)
{
  this.servicio.aEscanear(false);
  const respuesta = this.dialogo.open(SesionComponent, 
    {
      width: "400px", panelClass: 'dialogo', data: { tiempo: 10, sesion: 1, rolBuscar: "", opcionSel: opcion, idUsuario: 0, usuario: "", clave: "", titulo: this.servicio.rTraduccion()[266], mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[122], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_sesion" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      this.servicio.aEscanear(true);
      if (result)
      {
        if (result.accion == 1) 
        {
          if (opcion == 390)
          {
            this.crearSolicitud(parte, cantidad);
          }
          if (opcion == 397 && transaccion > 0)
          {
            this.cancelarPunto(transaccion, 1);
          }
          else if (opcion == 397)
          {
            this.cancelarRuta(2);
          }
          else if (opcion == 392)
          {
            this.recibir(transaccion, cantidad, 1);
          }
          else if (opcion == 394)
          {
            this.confirmador = result.idUsuario;
            this.recibir(transaccion, cantidad, 2);
          }
          else if (opcion == 11)
          {
            this.rRegistros(11);
            this.vistaOperador = false;
            this.enTecnico = true;
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

  filtrarKanban(id: number)
  {
    if (this.miSeleccion == 100)
    {
      return;
    }
    this.filtrarInventario = this.miSeleccion == 110 ? 1 : 2;
    this.filtrarInventarioPor = this.miSeleccion == 110 ? this.registros[id].proceso : this.registros[id].parte; 
    this.filtrarInventarioPorDes = this.miSeleccion == 110 ? this.registros[id].nproceso : this.registros[id].nparte; 
    this.rRegistros(100)
  }


  regMov(id: number)
  {
    this.existencia = this.registros[id].saldo;
    this.cadFiltro = " WHERE a.parte = " + this.registros[id].parte + " AND a.proceso = " + this.registros[id].proceso 
    this.rRegistros(130);
    this.nombreParte = this.registros[id].nparte;
    this.nombreProceso = this.registros[id].nproceso;

  }

  nuevo(id: number)
  {
    let sentencia = "SELECT a.id FROM " + this.servicio.rBD() + ".cat_kanban a WHERE a.estatus = 'A'"
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length == 0)
      {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4165], mensaje: this.servicio.rTraduccion()[4166], id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_rutas" }
          });
          
      }
      else
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "500px", panelClass: 'dialogo', data: { titulo: this.servicio.rTraduccion()[4167], mensaje: "", kanban: 40, botones: 2, boton1STR: this.servicio.rTraduccion()[4168], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_rutas" }
        });
        respuesta.afterClosed().subscribe(result => {
          if (!result)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          if (result.accion == 1) 
          {
            sentencia = "SELECT * FROM " + this.servicio.rBD() + ".det_kanban a WHERE a.ruta = " + result.kanbanPlan + " AND a.usar = 'S' AND a.cantidad_sugerida > 0 ORDER BY a.secuencia"
            campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( detalleKanban =>
            {
              if (detalleKanban.length == 0)
              {
                const respuesta = this.dialogo.open(DialogoComponent, {
                  width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4177], mensaje: this.servicio.rTraduccion()[4176], id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_rutas" }
                });
                return;
              }
              let miFecha = this.servicio.fecha(2, result.fdesde, "yyyy/MM/dd") + " " + result.desde
              sentencia = "INSERT INTO " + this.servicio.rBD() + ".rkanban_cab (kanban, nombre, inicio, area, notas, usuario_asignado, total_lineas, respetar_secuencia, tipo, creacion, creador) VALUES(" + result.kanbanPlan + ", '" + result.nombre + "', '" + miFecha + "', " + result.area + ", '" + result.notas + "', " + result.kanbanUsuario + ", " + detalleKanban.length + ", '" + result.respetar_secuencia + "', 1, NOW(), " + this.servicio.rUsuario().id + ")"
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( upd =>
              {
                sentencia = "SELECT MAX(id) AS nuevoid FROM " + this.servicio.rBD() + ".rkanban_cab;";
                campos = {accion: 100, sentencia: sentencia};  
                this.servicio.consultasBD(campos).subscribe( cab =>
                {
                  let cadTablas = "INSERT INTO " + this.servicio.rBD() + ".rkanban_det (kanban, secuencia, parte, proceso, cantidad solicitada, alarmar, tiempo, area) VALUES"
                  for (var i = 0; i < detalleKanban.length; i++) 
                  {
                  
                    cadTablas = cadTablas + " (" + cab[0].nuevoid + ", " + detalleKanban[i].secuencia + ", " + detalleKanban[i].parte + ", " + detalleKanban[i].proceso + ", " + detalleKanban[i].cantidad_sugerida + ", '" + detalleKanban[i].alarmar + "', " + detalleKanban[i].tiempo + ", " + result.area + "),"
                  }
                  cadTablas = cadTablas.substr(0, cadTablas.length - 1);
                  let campos = {accion: 200, sentencia: cadTablas};  
                  this.servicio.consultasBD(campos).subscribe( resp =>
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "snack-normal";
                    mensajeCompleto.mensaje = this.servicio.rTraduccion()[4174].replace("campo_0", cab[0].nuevoid).replace("campo_1", miFecha).replace("campo_2", detalleKanban.length);
                    mensajeCompleto.tiempo = 2000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  });
                }); 
              });
            });
          }
          else if (result.accion == 2) 
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
        })

      }
    })
    
  }

  calcularElementos()
  {
    if (this.mBotones)
    {
      this.anchoTitulo =  this.mBotones.nativeElement.offsetWidth;
      this.iniciadoFondo = true;
    }
    else if (!this.iniciadoFondo)
    {
      setTimeout(() => {
        this.calcularElementos()
      }, 50);
    }

  }

  abrirRuta(id: number)
  {
    this.rutaCabecera = this.registros[id].id; 
    this.rutaCabeceraNombre = this.registros[id].nombre; 
    this.uAsignado = this.registros[id].nusuario; 
    this.respetar_secuencia = this.registros[id].respetar_secuencia; 
    this.linea_siguiente = +this.registros[id].linea_siguiente; 
    this.lineas_completadas = +this.registros[id].lineas_completadas; 
    this.total_lineas = +this.registros[id].total_lineas;
    if (this.registros[id].total_lineas == 0)
    {
      this.cadAvance = this.registros[id].lineas_completadas + " " + this.servicio.rTraduccion()[3996] + " " + this.registros[id].total_lineas + " (0%)";  
    }
    else
    {
      this.cadAvance = this.registros[id].lineas_completadas + " " + this.servicio.rTraduccion()[3996] + " " + this.registros[id].total_lineas + " (" + Math.round(+this.registros[id].lineas_completadas / +this.registros[id].total_lineas * 100) + "%)";
    }
    
    this.rRegistros(210);
  }

  cancelarRuta(id: number)
  {
    if (id == 0)
    {
      this.validarOpcion(397, "0", 0, 0);
      return;
    }
    
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4216], mensaje: this.servicio.rTraduccion()[4217], botones: 2, boton1STR: this.servicio.rTraduccion()[4216], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
    });
    respuesta.afterClosed().subscribe(result => {
      this.servicio.aEscanear(true);
      if (!result)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_det SET estado = 99, evaluacion = 'N', cancelado_por = " + this.servicio.rUsuario().id + ", cancelado_fecha = NOW() WHERE estado < 10 AND kanban = " + this.rutaCabecera + ";UPDATE " + this.servicio.rBD() + ".rkanban_cab SET estado = 90, cancelado_por = " + this.servicio.rUsuario().id + ", cancelado_fecha = NOW() WHERE id = " + this.rutaCabecera;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4216], mensaje: this.servicio.rTraduccion()[4218].replace("campo_0", this.rutaCabecera), alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
          });
          this.regresar(0)
        })
      }
      else if (result.accion == 2) 
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
    return;
  }

  cancelarPunto(id: number, accion: number)
  {
    
    if (accion == 0)
    {
      id = id + 1;
      this.validarOpcion(397, "0", 0, id);
      return;
    }

    id = id - 1;
    
    const respuesta = this.dialogo.open(DialogoComponent, {
     width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4340], mensaje: this.servicio.rTraduccion()[4341], alto: "40", id: 0, accion: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[4339], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
    });
    
    respuesta.afterClosed().subscribe(result => {
      this.servicio.aEscanear(true);
      if (!result)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_det SET estado = 90, evaluacion = 'N', cancelado_por = " + this.servicio.rUsuario().id + ", cancelado_fecha = NOW() WHERE secuencia = " + this.registros[id].secuencia + " AND kanban = " + +this.rutaCabecera
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          sentencia = "SELECT a.secuencia, a.planeado FROM " + this.servicio.rBD() + ".rkanban_det a WHERE a.kanban = " + +this.rutaCabecera + " AND a.estado < 10 ORDER BY a.secuencia ASC LIMIT 1";
            campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp2 =>
            {
              const respuesta = this.dialogo.open(DialogoComponent, {
                width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4339], mensaje: this.servicio.rTraduccion()[4342].replace("campo_0", this.registros[id].secuencia).replace("campo_1", this.servicio.rUsuario().nombre), alto: "40", id: 0, accion: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_alerta" }
              });
              this.regresar(0)
              if (resp2.length > 0)
              {
                sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET estado = 10, reprogramar = 'S', alarmado = 'P', linea_siguiente = " + resp2[0].secuencia + ", fecha_siguiente = '" + this.servicio.fecha(2, '' + new Date(resp2[0].planeado) , 'yyyy/MM/dd HH:mm:ss') + "' WHERE id = " + +this.rutaCabecera
              }
              else
              {
                sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET estado = 50, reprogramar = 'F', fin = NOW() WHERE id = " + +this.rutaCabecera
              }
              campos = {accion: 200, sentencia: sentencia};  
              
              this.servicio.consultasBD(campos).subscribe( upd =>
              {
              });
            })
          
        })
      }
      else if (result.accion == 2) 
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "snack-error";
        mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
    })
    return;
  }
  
  editarPunto(id: number)
  {
    this.servicio.aEscanear(false);
    if (this.linea_siguiente != this.registros[id].secuencia)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4223], mensaje: this.servicio.rTraduccion()[4224], botones: 2, boton1STR: this.servicio.rTraduccion()[4225], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (!result)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (result.accion == 1) 
        {
          this.recibirSurtido(id, false);
        }
        else if (result.accion == 2) 
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error";
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      })
    }
    else
    {
      this.recibirSurtido(id, true);
    }
  }


  recibirSurtido(id: number, confirmar: boolean)
  {
    if (confirmar)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "460px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4235], mensaje: this.servicio.rTraduccion()[4236].replace("campo_0", this.registros[id].nparte).replace("campo_1", this.registros[id].nproceso).replace("campo_2", this.registros[id].cantidad_solicitada * 1).replace("campo_3", this.registros[id].nunidad), botones: 2, boton1STR: this.servicio.rTraduccion()[4237], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_produccion" }
      });
      respuesta.afterClosed().subscribe(result => {
        this.servicio.aEscanear(true);
         if (!result)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (result.accion == 1)
          {
            this.recibirSurtido(id, false);
          }
          else if (result.accion == 2) 
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "snack-error";
            mensajeCompleto.mensaje = this.servicio.rTraduccion()[1381];
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
      })
    }
    else
    {
      let sentencia = "SELECT a.kanban, a.secuencia, a.cantidad_solicitada, b.nombre AS nparte, c.nombre AS nproceso, f.nombre AS nunidad, f.nombre AS nunidadc FROM " + this.servicio.rBD() + ".rkanban_det a INNER JOIN " + this.servicio.rBD() + ".cat_partes b ON a.parte = b.id INNER JOIN " + this.servicio.rBD() + ".cat_procesos c ON a.proceso = c.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales f ON b.kanban_unidad = f.id WHERE a.kanban = " + +this.rutaCabecera + " AND a.secuencia = " + this.registros[id].secuencia + " AND a.estado < 10 ORDER BY a.secuencia ASC LIMIT 1";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_det SET cantidad_confirmada = cantidad_solicitada, ejecutado = NOW(), ejecutado_por = " + this.servicio.rUsuario().id + ", estado = 10, turno_entrega = " + this.servicio.rTurno().id + " WHERE kanban = " + +this.rutaCabecera + " AND secuencia = " +this.registros[id].secuencia + ";"
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( upd =>
          {
            sentencia = "SELECT a.secuencia, a.planeado FROM " + this.servicio.rBD() + ".rkanban_det a WHERE a.kanban = " + +this.rutaCabecera + " AND a.estado < 10 ORDER BY a.secuencia ASC LIMIT 1";
            campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp2 =>
            {
              if (resp2.length > 0)
              {
                this.servicio.aEscanear(true);
                sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET estado = 10, reprogramar = 'S', alarmado = 'P', lineas_completadas = lineas_completadas + 1, linea_siguiente = " + resp2[0].secuencia + ", fecha_siguiente = '" + this.servicio.fecha(2, '' + new Date(resp2[0].planeado) , 'yyyy/MM/dd HH:mm:ss') + "' WHERE id = " + +resp[0].kanban
                campos = {accion: 200, sentencia: sentencia};  
                this.servicio.consultasBD(campos).subscribe( upd =>
                {
                  this.linea_siguiente = +resp2[0].secuencia;
                  this.lineas_completadas  = this.lineas_completadas  + 1;
                  this.cadAvance = this.lineas_completadas + " " + this.servicio.rTraduccion()[3996] + " " + this.total_lineas + " (" + Math.round(+this.lineas_completadas / +this.total_lineas * 100) + "%)";
                  const respuesta = this.dialogo.open(DialogoComponent, {
                    width: "460px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4226], mensaje: this.servicio.rTraduccion()[4227].replace("campo_0", resp[0].secuencia).replace("campo_1", resp[0].nparte).replace("campo_2", resp[0].nproceso).replace("campo_3", resp[0].cantidad_solicitada * 1).replace("campo_4", resp[0].nunidad), alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
                    });
                })
              }
              else
              {
                sentencia = "UPDATE " + this.servicio.rBD() + ".rkanban_cab SET lineas_completadas = lineas_completadas + 1, estado = 50, reprogramar = 'F', fin = NOW() WHERE id = " + +resp[0].kanban
                campos = {accion: 200, sentencia: sentencia};  
                this.servicio.consultasBD(campos).subscribe( upd =>
                {
                  const respuesta = this.dialogo.open(DialogoComponent, {
                    width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[4229], mensaje: this.servicio.rTraduccion()[4230], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
                  });
                  this.regresar(0);
                });
              }
              
            })
          })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "snack-error"
          mensajeCompleto.mensaje = this.servicio.rTraduccion()[4228];            
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      })
    }
    
  }
  
  irHasta(id: number) {
    const itemToScrollTo = document.getElementById('item-' + id);
    if (itemToScrollTo) 
    {
      itemToScrollTo.scrollIntoView({ behavior: 'smooth' });
    }
  }

  llegoUltimo()
  {
    setTimeout(() => {
      this.irHasta(this.idBuscar);  
    }, 500);
    
  }
  
  finalizar()
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "520px", panelClass: 'dialogo_atencion', data: { titulo: this.servicio.rTraduccion()[4295], mensaje: this.servicio.rTraduccion()[4296].replace("campo_0", this.servicio.rUsuario().nombre), id: 0, accion: 0, tiempo: 0, botones: 2, boton1STR: this.servicio.rTraduccion()[261], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "i_salir" }
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
          this.servicio.rSesion.emit(2);
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

 
}

