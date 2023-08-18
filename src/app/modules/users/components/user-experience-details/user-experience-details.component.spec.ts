import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExperienceDetailsComponent } from './user-experience-details.component';

describe('UserExperienceDetailsComponent', () => {
  let component: UserExperienceDetailsComponent;
  let fixture: ComponentFixture<UserExperienceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserExperienceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExperienceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
