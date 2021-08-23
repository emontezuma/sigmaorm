import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogowipComponent } from './dialogowip.component';

describe('DialogowipComponent', () => {
  let component: DialogowipComponent;
  let fixture: ComponentFixture<DialogowipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogowipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogowipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
