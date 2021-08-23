import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { registerLocaleData } from '@angular/common';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);
import { InterceptorService } from './interceptor.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilterlistPipe } from './pipes/filterlist.pipe';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import 'rxjs';
import { DialogoComponent } from './dialogo/dialogo.component';
import { VisorComponent } from './visor/visor.component';
import { SesionComponent } from './sesion/sesion.component';
import { BlankComponent } from './blank/blank.component';
import { AndonComponent } from './andon/andon.component';
import { SnackComponent } from './snack/snack.component';
import { CatalogosComponent } from './catalogos/catalogos.component';
import { CatalogoswipComponent } from './catalogoswip/catalogoswip.component';
import { GraficasComponent } from './graficas/graficas.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { DxColorBoxModule } from 'devextreme-angular';
import { DxChartModule, DxPieChartModule } from 'devextreme-angular';
import { DxCircularGaugeModule } from 'devextreme-angular'
import { DxLinearGaugeModule } from 'devextreme-angular'
import { DxBarGaugeModule } from 'devextreme-angular';
import { ExportarComponent } from './exportar/exportar.component';
import { ParametrosComponent } from './parametros/parametros.component';
import { LicenciaComponent } from './licencia/licencia.component';
import { ContabilizaComponent } from './contabiliza/contabiliza.component';
import { ProduccionComponent } from './produccion/produccion.component';
import { FijarequiComponent } from './fijarequi/fijarequi.component';
import { SmedComponent } from './smed/smed.component';
import { PanelComponent } from './panel/panel.component';
import { FlujoComponent } from './flujo/flujo.component';
import { DialogowipComponent } from './dialogowip/dialogowip.component';
import { OperacionesComponent } from './operaciones/operaciones.component';
import { GeslotesComponent } from './geslotes/geslotes.component';
import { DocumentacionComponent } from './documentacion/documentacion.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ParoComponent } from './paro/paro.component';
import { FiltroparoComponent } from './filtroparo/filtroparo.component';
import { FiltrorechazoComponent } from './filtrorechazo/filtrorechazo.component';
import { ProgramadorComponent } from './programador/programador.component';
import { TemasComponent } from './temas/temas.component';
import { HoraxhoraComponent } from './horaxhora/horaxhora.component';
import { KanbanComponent } from './kanban/kanban.component';
import { PdfComponent } from './pdf/pdf.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/vacio', pathMatch: 'full', data:  { state: 'vacio' } },
  { path: 'vacio', component: BlankComponent, data:  { state: 'vacio', valor: '100' } },
  { path: 'visor', component: VisorComponent, data:  { state: 'visor', valor: '100' } },
  { path: 'panel', component: PanelComponent, data:  { state: 'panel', valor: '100' } },
  { path: 'produccion', component: ProduccionComponent, data:  { state: 'produccion', valor: '100' } },
  { path: 'andon', component: AndonComponent, data:  { state: 'andon', valor: '100' } },
  { path: 'kanban', component: KanbanComponent, data:  { state: 'kanban', valor: '100' } },
  { path: 'catalogos', component: CatalogosComponent, data:  { state: 'catalogos', valor: '100' } },
  { path: 'catalogoswip', component: CatalogoswipComponent, data:  { state: 'catalogoswip', valor: '100' } },
  { path: 'flujo', component: FlujoComponent, data:  { state: 'flujo', valor: '100' } },
  { path: 'graficas', component: GraficasComponent, data:  { state: 'graficas', valor: '100' } },
  { path: 'exportar', component: ExportarComponent, data:  { state: 'exportar', valor: '100' } },
  { path: 'parametros', component: ParametrosComponent, data:  { state: 'parametros', valor: '100' } },
  { path: 'operaciones', component: OperacionesComponent, data:  { state: 'operaciones', valor: '100' } },
  
];

@NgModule({
  declarations: [
    AppComponent,
    DialogoComponent,
    VisorComponent,
    SesionComponent,
    BlankComponent,
    AndonComponent,
    SnackComponent,
    CatalogosComponent,
    CatalogoswipComponent,
    ContabilizaComponent,
    GraficasComponent,
    ExportarComponent,
    ParametrosComponent,
    LicenciaComponent,
    ProduccionComponent,
    FijarequiComponent,
    SmedComponent,
    PanelComponent,
    FlujoComponent,
    DialogowipComponent,
    OperacionesComponent,
    GeslotesComponent,
    DocumentacionComponent,
    ParoComponent,
    FiltroparoComponent,
    FiltrorechazoComponent,
    ProgramadorComponent,
    TemasComponent,
    FilterlistPipe,
    HoraxhoraComponent,
    KanbanComponent,
    PdfComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    DxChartModule,
    DxColorBoxModule,
    DxCircularGaugeModule,
    DxLinearGaugeModule,
    DxBarGaugeModule,
    NgxQRCodeModule,    
  ],
  entryComponents: [ DialogoComponent, HoraxhoraComponent, LicenciaComponent, SesionComponent, SnackComponent, ContabilizaComponent, PdfComponent, FijarequiComponent, SmedComponent, DialogowipComponent, GeslotesComponent, DocumentacionComponent, ParoComponent, FiltroparoComponent, FiltrorechazoComponent, ProgramadorComponent, TemasComponent ],
  providers: [ {provide: LOCALE_ID, useValue: "es-MX" }, 
  DatePipe, MatDatepickerModule, 
  {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  },
  {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  {provide: LocationStrategy, useClass: HashLocationStrategy},
  {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
