import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QBComponent } from './qb.component';

describe('QBComponent', () => {
  let component: QBComponent;
  let fixture: ComponentFixture<QBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
