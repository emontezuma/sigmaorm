import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OperacionesComponent } from './operaciones.component';

describe('OperacionesComponent', () => {
  let component: OperacionesComponent;
  let fixture: ComponentFixture<OperacionesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OperacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
