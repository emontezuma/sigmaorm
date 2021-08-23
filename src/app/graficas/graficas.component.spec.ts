import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraficasComponent } from './graficas.component';

describe('GraficasComponent', () => {
  let component: GraficasComponent;
  let fixture: ComponentFixture<GraficasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GraficasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
