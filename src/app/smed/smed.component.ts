import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-smed',
  templateUrl: './smed.component.html',
  styleUrls: ['./smed.component.css']
})
export class SmedComponent implements OnInit {

  @ViewChild("lstC0", { static: false }) lstC0: MatSelect;


  constructor(
    public servicio: ServicioService,
    public dialogRef: MatDialogRef<SmedComponent>, 
    public dialogo: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) 
  {
    this.llenarPagers();
    this.rConfiguracion();
  }
  
  local: string = "";
  clavePublica: string = "";
  claveInterna: string = "";
  tipo: string = "";
  palabraClave: string = "CronosIntegracion2019";
  clave: string = "";
  movil: boolean = false;
  noLicenciados: number = 0;
  tEnviados: number = 0;
  seleccionMensaje = [];
  seleccionParte = [];
  configuracion: any;
  pagers: any = [];
  maquinas: any = [];
  partes: any = [];
  maquina: number = -1;
  error01: boolean = false;
  error02: boolean = false;
  error03: boolean = false;
  mensajeSMED: string = "";
  validar01: boolean = false;
  validar02: boolean = false;
  faltaMensaje: boolean = true;

  ngOnInit() {
  }

  llenarPagers()
  {
    this.pagers = [];
    let sentencia = "SELECT id, nombre, url_mmcall FROM " + this.servicio.rBD() + ".cat_generales WHERE  estatus = 'A' AND tabla = 100 ORDER BY nombre";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.pagers = resp
    })

    this.maquinas = [];
    sentencia = "SELECT a.id, a.url_mmcall, CASE WHEN ISNULL(c.nombre) THEN a.nombre ELSE CONCAT(a.nombre, ' / ',  c.nombre) END AS nombre, a.nombre AS nmaquina FROM " + this.servicio.rBD() + ".cat_maquinas a LEFT JOIN " + this.servicio.rBD() + ".cat_lineas c ON a.linea = c.id ORDER BY nombre"
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.maquinas = resp
    })
  }

  llenarPartes()
  {
    this.servicio.activarSpinnerSmall.emit(true);  
    this.partes = [];
    this.seleccionParte = [];
    let sentencia = "SELECT a.id, a.nombre FROM " + this.servicio.rBD() + ".cat_partes a INNER JOIN " + this.servicio.rBD() + ".relacion_partes_maquinas b ON a.id = b.parte AND b.maquina = " + this.maquinas[this.maquina].id + " WHERE maquinas = 'N' AND herramentales = 'S' AND estatus = 'A' UNION ALL SELECT id, nombre FROM " + this.servicio.rBD() + ".cat_partes WHERE maquinas = 'S' AND herramentales = 'S' AND estatus = 'A' ORDER BY nombre";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length>0)
      {
        this.partes = resp
      }
      
      setTimeout(() => {
        this.servicio.activarSpinnerSmall.emit(false);    
      }, 200);
      
    })
  }

  cambiando(evento: any)
  {
    this.mensajeSMED = "";
    if (this.seleccionParte.length > 0 && this.maquina)
    {
      let cadPartes = "";
      for (var i = 0; i < this.seleccionParte.length; i++)
      {
        cadPartes = cadPartes + this.partes[this.seleccionParte[i]].nombre + "-"
      }
      this.mensajeSMED = cadPartes + this.servicio.rTraduccion()[482] + this.maquinas[this.maquina].nmaquina
      this.mensajeSMED = this.mensajeSMED.substring(0, 40);
    }
    else
    {
      this.mensajeSMED = "";
    }
    this.faltaMensaje = this.seleccionMensaje.length==0 || this.maquina ==-1 || this.seleccionParte.length==0
  }

  validar(id: number)
  {
    if (id == 1)
    {
      let sentencia = "SELECT CONCAT(key_number, serial) AS mmcall FROM mmcall.locations"
      let campos = {accion: 150, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          this.clave = resp[0].mmcall;
          this.hacerLlamada();
        }        
      })    
        
    }
    else
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
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

  hacerLlamada()
  {
    let urlFinal = "";
    for (var i = 0; i < this.seleccionMensaje.length; i++)
    {
      urlFinal = urlFinal + this.pagers[this.seleccionMensaje[i]].url_mmcall + ";"
    }
    urlFinal = urlFinal.substr(0, urlFinal.length - 1);

    if (this.configuracion.ip_localhost)
    {
      urlFinal = urlFinal.replace(/localhost:8081/gi, this.configuracion.ip_localhost);
    }
    
    let str = this.mensajeSMED;
    if (urlFinal=="")
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", panelClass:  'dialogo', data: { titulo: this.servicio.rTraduccion()[483], mensaje: this.servicio.rTraduccion()[484], alto: "40", id: 0, accion: 0, tiempo: 0, botones: 1, boton1STR: this.servicio.rTraduccion()[76], icono1: "in_seleccionado", boton2STR: this.servicio.rTraduccion()[77], icono2: "i_cancelar", icono0: "in_detener" }
      });
    }
    else
    {
      setTimeout(() => {
        this.finalizaLlamada()
      }, 1000);
      str = this.servicio.tildes(str, "M").substr(0, 40);
      str = str.replace(/[&\/\\()$~%.'":*#?<>{}]/g, " ");
      let destinos =  urlFinal.split(";");
      let mensajes: number = 0;
      let buenos: number = 0;
      let noLicenciados = 0;
      for (var i = 0; i < destinos.length; i++)
      {
        
        if (destinos[i].length > 0)
        {
          let directo: boolean = true;
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

  finalizaLlamada()
  {
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "snack-normal";
    mensajeCompleto.mensaje = this.servicio.rTraduccion()[2186].replace("campo_0", this.tEnviados);
    mensajeCompleto.tiempo = 3000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
    this.maquina = -1;
    this.mensajeSMED = "";
    this.faltaMensaje = true;
    this.seleccionMensaje = [];
    this.seleccionParte = [];
    setTimeout(() => {
      this.lstC0.focus()  
    }, 100);
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

  alterarPalabraClave()
  {
    let nvaPalabra = ""
    let palabraNueva = "ElViS"
    let ciclo = 0;
    for (var i = 0; i < this.palabraClave.length; i++) 
    {
      
      if (i > 0 && i % 5 == 0)
      {
        nvaPalabra = nvaPalabra + palabraNueva[ciclo];
        ciclo = ciclo + 1
      }
      else
      {
        nvaPalabra = nvaPalabra + this.palabraClave[i];
      }
    } 
    return nvaPalabra;  
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
    this.claveInterna = this.alterarPalabraClave();
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


}
