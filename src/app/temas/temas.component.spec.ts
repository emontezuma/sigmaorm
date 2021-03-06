import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemasComponent } from './temas.component';

describe('TemasComponent', () => {
  let component: TemasComponent;
  let fixture: ComponentFixture<TemasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
