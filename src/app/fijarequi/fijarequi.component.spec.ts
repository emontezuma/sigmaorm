import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FijarequiComponent } from './fijarequi.component';

describe('FijarequiComponent', () => {
  let component: FijarequiComponent;
  let fixture: ComponentFixture<FijarequiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FijarequiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FijarequiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
