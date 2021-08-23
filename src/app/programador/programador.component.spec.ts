import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProgramadorComponent } from './programador.component';

describe('ProgramadorComponent', () => {
  let component: ProgramadorComponent;
  let fixture: ComponentFixture<ProgramadorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
