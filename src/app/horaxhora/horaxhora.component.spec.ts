import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HoraxhoraComponent } from './horaxhora.component';

describe('HoraxhoraComponent', () => {
  let component: HoraxhoraComponent;
  let fixture: ComponentFixture<HoraxhoraComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HoraxhoraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoraxhoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
