import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogoswipComponent } from './catalogoswip.component';

describe('CatalogoswipComponent', () => {
  let component: CatalogoswipComponent;
  let fixture: ComponentFixture<CatalogoswipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoswipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoswipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
