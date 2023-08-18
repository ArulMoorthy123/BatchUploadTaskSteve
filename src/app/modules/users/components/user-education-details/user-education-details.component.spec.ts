import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEducationDetailsComponent } from './user-education-details.component';

describe('UserEducationDetailsComponent', () => {
  let component: UserEducationDetailsComponent;
  let fixture: ComponentFixture<UserEducationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEducationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEducationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
