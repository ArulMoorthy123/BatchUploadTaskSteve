import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateCallComponent } from './private-call.component';

describe('PrivateCallComponent', () => {
  let component: PrivateCallComponent;
  let fixture: ComponentFixture<PrivateCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
