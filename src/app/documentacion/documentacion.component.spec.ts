import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentacionComponent } from './documentacion.component';

describe('DocumentacionComponent', () => {
  let component: DocumentacionComponent;
  let fixture: ComponentFixture<DocumentacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
