import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FlujoComponent } from './flujo.component';

describe('FlujoComponent', () => {
  let component: FlujoComponent;
  let fixture: ComponentFixture<FlujoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlujoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlujoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
