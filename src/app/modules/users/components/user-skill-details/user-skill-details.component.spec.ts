import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSkillDetailsComponent } from './user-skill-details.component';

describe('UserSkillDetailsComponent', () => {
  let component: UserSkillDetailsComponent;
  let fixture: ComponentFixture<UserSkillDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSkillDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSkillDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
