import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ParoComponent } from './paro.component';

describe('ParoComponent', () => {
  let component: ParoComponent;
  let fixture: ComponentFixture<ParoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
