import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGroupInfoComponent } from './update-group-info.component';

describe('UpdateGroupInfoComponent', () => {
  let component: UpdateGroupInfoComponent;
  let fixture: ComponentFixture<UpdateGroupInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateGroupInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateGroupInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
