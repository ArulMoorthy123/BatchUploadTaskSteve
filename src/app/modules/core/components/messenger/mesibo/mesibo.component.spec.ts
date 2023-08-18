import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MesiboComponent } from './mesibo.component';

describe('MesiboComponent', () => {
  let component: MesiboComponent;
  let fixture: ComponentFixture<MesiboComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MesiboComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MesiboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
