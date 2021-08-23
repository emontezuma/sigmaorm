import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContabilizaComponent } from './contabiliza.component';

describe('ContabilizaComponent', () => {
  let component: ContabilizaComponent;
  let fixture: ComponentFixture<ContabilizaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContabilizaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContabilizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
