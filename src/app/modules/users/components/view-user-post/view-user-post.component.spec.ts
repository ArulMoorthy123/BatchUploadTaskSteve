import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserPostComponent } from './view-user-post.component';

describe('ViewUserPostComponent', () => {
  let component: ViewUserPostComponent;
  let fixture: ComponentFixture<ViewUserPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUserPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
