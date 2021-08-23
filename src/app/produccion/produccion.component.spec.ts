import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProduccionComponent } from './produccion.component';

describe('ProduccionComponent', () => {
  let component: ProduccionComponent;
  let fixture: ComponentFixture<ProduccionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProduccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
