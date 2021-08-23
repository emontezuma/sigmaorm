import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common'
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {

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
  tituloBoton: string = this.servicio.rTraduccion()[4365];
  

  constructor(
    public servicio: ServicioService,
    public dialogo: MatDialog, 
    public dialogRef: MatDialogRef<PdfComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any,
    public datepipe: DatePipe,
  ) 
  {
    
  }
  qrvalue = "";
  
  ngOnInit() {
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

  validar(id: number)
  {
    if (id == 1)
    {
      
      const doc = new jsPDF("p", "mm", "letter");
      let sentencia = "SELECT planta, logo_ruta, logo_alto, logo_ancho FROM " + this.servicio.rBD() + ".configuracion";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 0)
        {
          sentencia = "SELECT c.id, CASE WHEN c.origen = 0 THEN '" + this.servicio.rTraduccion()[2086] + "' ELSE '" + this.servicio.rTraduccion()[1296] + "' END, c.fecha AS fechar, c.fecha_reporte, IFNULL(l.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.estatus as estatusr, c.inicio_atencion, SEC_TO_TIME(c.tiempollegada) AS tiempollegada, c.cierre_atencion, SEC_TO_TIME(c.tiemporeparacion) AS tiemporeparacion, SEC_TO_TIME(c.tiemporeparacion + c.tiempollegada) AS totalrepar, " + (this.servicio.rVersion().modulos[5] == 1 || this.servicio.rVersion().modulos[10] == 1 ?  "CASE WHEN c.ultimo_rate > 0 THEN (c.tiemporeparacion + c.tiempollegada) / c.ultimo_rate ELSE 0 END, " : "") + "c.inicio_reporte, c.cierre_reporte, c.tiemporeporte, IFNULL(a.nombre, '" + this.servicio.rTraduccion()[8] + "') AS linean, c.linea, IFNULL(b.nombre, '" + this.servicio.rTraduccion()[8] + "') AS maquinan, c.maquina, IFNULL(d.nombre, '" + this.servicio.rTraduccion()[8] + "') AS arean, c.area, IFNULL(e.nombre, '" + this.servicio.rTraduccion()[8] + "') AS fallan, c.falla_ajustada, IFNULL(f.nombre, '" + this.servicio.rTraduccion()[8] + "') AS solici, IFNULL(j.nombre, '" + this.servicio.rTraduccion()[8] + "') AS dpto, IFNULL(h.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(g.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(p.nombre, '" + this.servicio.rTraduccion()[8] + "'), IFNULL(m.nombre, '" + this.servicio.rTraduccion()[8] + "') AS confirmador, IFNULL(k.nombre, '" + this.servicio.rTraduccion()[8] + "') AS tmantto, c.detalle, CASE WHEN c.contabilizar = 'S' THEN '" + this.servicio.rTraduccion()[352] + "' ELSE '" + this.servicio.rTraduccion()[353] + "' END AS contab, IFNULL(v.nombre, '" + this.servicio.rTraduccion()[8] + "'), c.contabilizar_fecha, CASE WHEN c.alarmado = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atender = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, CASE WHEN c.alarmado_atendido = 'N' THEN '" + this.servicio.rTraduccion()[353] + "' ELSE '" + this.servicio.rTraduccion()[352] + "' END, c.escalado, IFNULL(i.nombre , '" + this.servicio.rTraduccion()[8] + "') AS fallas, c.falla " + (this.servicio.rVersion().modulos[2] == 1 ? ", w.nombre AS herram, w.referencia AS hreferencia, z.p1, z.p2, z.p3, z.p4, z.p5, z.plan, z.fecha, z.responsable, z.departamento, z.mano_de_obra, z.material, z.metodo, z.maquina, z.medio_ambiente, z.comentarios, y.nombre, x.nombre, z.creacion, z.modificacion " : "") + " FROM " + this.servicio.rBD() + ".reportes c LEFT JOIN " + this.servicio.rBD() + ".cat_lineas a ON c.linea = a.id LEFT JOIN " + this.servicio.rBD() + ".cat_maquinas b ON c.maquina = b.id LEFT JOIN " + this.servicio.rBD() + ".cat_areas d ON c.area = d.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas e ON c.falla_ajustada = e.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios f ON c.solicitante = f.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios g ON c.tecnico = g.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios h ON c.tecnicoatend = h.id LEFT JOIN " + this.servicio.rBD() + ".cat_fallas i ON c.falla = i.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales j ON f.departamento = j.id LEFT JOIN " + this.servicio.rBD() + ".cat_generales k ON c.tipo = k.id LEFT JOIN " + this.servicio.rBD() + ".cat_turnos l ON c.turno = l.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios m ON c.confirmado = m.id LEFT JOIN " + this.servicio.rBD() + ".causa_raiz z ON c.id = z.reporte LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios y ON z.creado = y.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios x ON z.modificado = x.id LEFT JOIN " + this.servicio.rBD() + ".cat_partes w ON c.herramental = w.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios v ON c.contabilizar_usuario = v.id LEFT JOIN " + this.servicio.rBD() + ".cat_usuarios p ON c.tecnico_documento = p.id WHERE c.id = " + this.reporte;
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
            doc.text(this.servicio.rTraduccion()[2088] + ": " + this.reporte, 10, 28);
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
            
            
            doc.save(this.reporte + ".pdf");
          });
        } 
      })
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
      this.qrvalue = '' + this.reporte; 
      this.encontrado = true;
      this.detalle = resp[0];
    }
    else
    {
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "snack-normal";
      mensajeCompleto.mensaje = this.servicio.rTraduccion()[167];
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      this.detalle = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
      
      this.encontrado = false;
    }
  })
}

iniReporte()
{
  this.detalle = {fecha_reporte: "-", nsolicitante: "-", nmaquina: "-", nfalla: "-", nestatus: "-", contabilizar: ""};
  
  this.encontrado = false;
}

}
