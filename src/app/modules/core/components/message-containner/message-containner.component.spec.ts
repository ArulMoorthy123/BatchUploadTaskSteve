import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageContainnerComponent } from './message-containner.component';

describe('MessageContainnerComponent', () => {
  let component: MessageContainnerComponent;
  let fixture: ComponentFixture<MessageContainnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageContainnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageContainnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
